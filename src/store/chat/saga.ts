import { put, select, call, take, takeEvery, spawn, race, takeLatest, all } from 'redux-saga/effects';
import { takeEveryFromBus } from '../../lib/saga';

import { setActiveConversationId, setIsConversationErrorDialogOpen, SagaActionTypes } from '.';
import { createChatConnection, getChatBus } from './bus';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { getSSOToken } from '../authentication/api';
import { currentUserSelector } from '../authentication/saga';
import { saveUserMatrixCredentials } from '../edit-profile/saga';
import { receive } from '../users';
import { chat } from '../../lib/chat';
import { ConversationEvents, getConversationsBus } from '../channels-list/channels';
import { getHistory } from '../../lib/browser';
import { activeConversationIdSelector } from './selectors';
import { openFirstConversation } from '../channels/saga';
import { rawConversationsList, waitForChannelListLoad } from '../channels-list/saga';
import { featureFlags } from '../../lib/feature-flags';

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
  yield put(setActiveConversationId(null));
}

function* addAdminUser() {
  yield put(receive({ userId: 'admin', firstName: 'Admin', profileImage: null, matrixId: 'admin' }));
}

// The selected conversation is managed via the URL
export function* setActiveConversation(id: string) {
  const history = yield call(getHistory);
  history.push({ pathname: `/conversation/${id}` });
}

export function* validateActiveConversation() {
  const isLoaded = yield call(waitForChannelListLoad);
  if (isLoaded) {
    yield call(performValidateActiveConversation);
  }
}

function isAlias(id) {
  return id.startsWith('#');
}

export function* performValidateActiveConversation() {
  const [conversationList, activeConversationId] = yield all([
    select(rawConversationsList()),
    select(activeConversationIdSelector),
  ]);

  if (!activeConversationId) {
    yield put(setIsConversationErrorDialogOpen(false));
    return;
  }

  const chatClient = yield call(chat.get);
  let conversationId = activeConversationId;
  if (isAlias(activeConversationId)) {
    // conversation can be referenced by an id or an alias
    conversationId = yield call([chatClient, chatClient.getRoomIdForAlias], activeConversationId);
  }

  const isMemberOfActiveConversation = conversationList.includes(conversationId);
  yield put(setIsConversationErrorDialogOpen(!isMemberOfActiveConversation));

  // either the room does not exist, or the user isn't a part of it
  if (!conversationId || !isMemberOfActiveConversation) {
    if (!featureFlags.allowJoinRoom) {
      return;
    }

    conversationId = yield call(
      [chatClient, chatClient.joinRoom],
      conversationId ? conversationId : activeConversationId
    );
  }
  yield put(setActiveConversationId(conversationId));
}

export function* closeErrorDialog() {
  yield put(setIsConversationErrorDialogOpen(false));
  yield call(openFirstConversation);
}

export function* saga() {
  yield spawn(connectOnLogin);
  yield takeLatest(setActiveConversationId.type, validateActiveConversation);

  const authBus = yield call(getAuthChannel);
  yield takeEveryFromBus(authBus, AuthEvents.UserLogout, clearOnLogout);
  yield takeEveryFromBus(authBus, AuthEvents.UserLogin, addAdminUser);

  yield takeLatest(SagaActionTypes.CloseConversationErrorDialog, closeErrorDialog);
}
