import { put, select, call, take, takeEvery, spawn, race, takeLatest } from 'redux-saga/effects';
import { takeEveryFromBus } from '../../lib/saga';

import {
  rawSetActiveConversationId,
  SagaActionTypes,
  setJoinRoomErrorContent,
  clearJoinRoomErrorContent,
  setIsJoiningConversation,
  setIsChatConnectionComplete,
} from '.';
import { Events as ChatEvents, createChatConnection, getChatBus } from './bus';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { getSSOToken } from '../authentication/api';
import { currentUserSelector } from '../authentication/saga';
import { saveUserMatrixCredentials } from '../edit-profile/saga';
import { receive } from '../users';
import { chat, getRoomIdForAlias } from '../../lib/chat';
import { ConversationEvents, getConversationsBus } from '../channels-list/channels';
import { getHistory } from '../../lib/browser';
import { openFirstConversation } from '../channels/saga';
import { rawConversationsList } from '../channels-list/saga';
import { featureFlags } from '../../lib/feature-flags';
import { translateJoinRoomApiError, parseAlias, isAlias } from './utils';
import { joinRoom as apiJoinRoom } from './api';

function* initChat(userId, chatAccessToken) {
  const { chatConnection, connectionPromise, activate } = createChatConnection(userId, chatAccessToken, chat.get());
  const id = yield connectionPromise;
  if (id !== userId) {
    yield call(saveUserMatrixCredentials, id, 'not-used');
  }
  yield takeEvery(chatConnection, convertToBusEvents);

  yield spawn(closeConnectionOnLogout, chatConnection);
  yield spawn(activateWhenConversationsLoaded, activate);
}

// This will wait until all the initial batch of "snapshot state" rooms
// have been loaded into the state AND the "catchup events" have all been
// published. However, there is no way to know if all the handlers of those
// "catchup events" have actually completed as any handler may have async
// operations.
export function* waitForChatConnectionCompletion() {
  const isComplete = yield select((state) => state.chat.isChatConnectionComplete);
  if (isComplete) {
    return true;
  }

  const { complete } = yield race({
    complete: take(yield call(getChatBus), ChatEvents.ChatConnectionComplete),
    abort: take(yield call(getAuthChannel), AuthEvents.UserLogout),
  });
  if (complete) {
    yield put(setIsChatConnectionComplete(true));
    return true;
  }
  return false;
}

function* convertToBusEvents(action) {
  const chatBus = yield call(getChatBus);
  yield put(chatBus, action);
}

function* connectOnLogin() {
  yield take(yield call(getAuthChannel), AuthEvents.UserLogin);
  const user = yield select(currentUserSelector());
  const userId = user.matrixId;
  const token = yield call(getSSOToken);
  const chatAccessToken = token.token;

  yield initChat(userId, chatAccessToken);
}

function* closeConnectionOnLogout(chatConnection) {
  yield take(yield call(getAuthChannel), AuthEvents.UserLogout);
  chatConnection.close();
  yield spawn(connectOnLogin);
}

function* activateWhenConversationsLoaded(activate) {
  const { conversationsLoaded } = yield race({
    conversationsLoaded: take(yield call(getConversationsBus), ConversationEvents.ConversationsLoaded),
    abort: take(yield call(getAuthChannel), AuthEvents.UserLogout),
  });

  if (conversationsLoaded) {
    activate();
  } // else: abort. noop. Just stop listening for events.
}

function* clearOnLogout() {
  yield put(rawSetActiveConversationId(null));
  yield put(setIsChatConnectionComplete(false));
}

function* addAdminUser() {
  yield put(receive({ userId: 'admin', firstName: 'Admin', profileImage: null, matrixId: 'admin' }));
}

// The selected conversation is managed via the URL
export function* setActiveConversation(id: string) {
  const history = yield call(getHistory);
  history.push({ pathname: `/conversation/${id}` });
}

export function* validateActiveConversation(conversationId: string) {
  yield put(setIsJoiningConversation(true));

  const isLoaded = yield call(waitForChatConnectionCompletion);
  if (isLoaded) {
    yield call(performValidateActiveConversation, conversationId);
  }

  yield put(setIsJoiningConversation(false));
}

export function* joinRoom(roomIdOrAlias: string) {
  const { success, response } = yield call(apiJoinRoom, roomIdOrAlias);

  if (!success) {
    const error = translateJoinRoomApiError(response);
    yield put(setJoinRoomErrorContent(error));
  } else {
    yield put(clearJoinRoomErrorContent());
    yield call(setWhenUserJoinedRoom, response.roomId);
  }
}

export function* isMemberOfActiveConversation(activeConversationId) {
  const conversationList = yield select(rawConversationsList());
  return conversationList.includes(activeConversationId);
}

// NOTE: we're waiting for the event to be fired, but if it doesn't..then
// we should just keep showing the loading spinner?
export function* setWhenUserJoinedRoom(conversationId: string) {
  if (yield call(isMemberOfActiveConversation, conversationId)) {
    yield put(rawSetActiveConversationId(conversationId));
    return;
  }

  let success = false;
  while (!success) {
    const { userJoined, abort } = yield race({
      userJoined: take(yield call(getConversationsBus), ConversationEvents.UserJoinedConversation),
      abort: take(yield call(getAuthChannel), AuthEvents.UserLogout),
    });

    if (abort) {
      return;
    }

    success = userJoined.conversationId === conversationId;
  }

  yield put(rawSetActiveConversationId(conversationId));
}

export function* performValidateActiveConversation(activeConversationId: string) {
  if (!activeConversationId) {
    yield put(clearJoinRoomErrorContent());
    yield call(openFirstConversation);
    return;
  }

  if (!featureFlags.allowJoinRoom) {
    const isUserMemberOfActiveConversation = yield call(isMemberOfActiveConversation, activeConversationId);
    if (isUserMemberOfActiveConversation) {
      yield put(rawSetActiveConversationId(activeConversationId));
    } else {
      yield put(
        setJoinRoomErrorContent({
          header: 'There’s no one here...',
          body: 'This conversation does not exist or you are not a member.',
        })
      );
    }
    return;
  }

  let conversationId = activeConversationId;
  if (isAlias(activeConversationId)) {
    activeConversationId = parseAlias(activeConversationId);
    conversationId = yield call(getRoomIdForAlias, activeConversationId);
  }

  const isUserMemberOfActiveConversation = yield call(isMemberOfActiveConversation, conversationId);
  if (!conversationId || !isUserMemberOfActiveConversation) {
    yield call(joinRoom, conversationId ?? activeConversationId);
    return;
  }

  yield put(rawSetActiveConversationId(conversationId));
}

export function* closeErrorDialog() {
  yield put(clearJoinRoomErrorContent());
  yield call(openFirstConversation);
}

export function* saga() {
  yield spawn(connectOnLogin);
  yield takeLatest(SagaActionTypes.setActiveConversationId, ({ payload }: any) =>
    validateActiveConversation(payload.id)
  );

  const authBus = yield call(getAuthChannel);
  yield takeEveryFromBus(authBus, AuthEvents.UserLogout, clearOnLogout);
  yield takeEveryFromBus(authBus, AuthEvents.UserLogin, addAdminUser);

  yield takeLatest(SagaActionTypes.CloseConversationErrorDialog, closeErrorDialog);
}
