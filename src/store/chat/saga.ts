import { put, select, call, take, takeEvery, spawn, race, takeLatest, delay, cancel, fork } from 'redux-saga/effects';
import { takeEveryFromBus } from '../../lib/saga';

import {
  rawSetActiveConversationId,
  SagaActionTypes,
  setJoinRoomErrorContent,
  clearJoinRoomErrorContent,
  setIsJoiningConversation,
  setIsChatConnectionComplete,
  setIsConversationsLoaded,
  setLoadingConversationProgress,
} from '.';
import { Events as ChatEvents, createChatConnection, getChatBus } from './bus';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { getSSOToken } from '../authentication/api';
import { currentUserSelector } from '../authentication/selectors';
import { saveUserMatrixCredentials } from '../edit-profile/saga';
import { receive } from '../users';
import { chat, getRoomIdForAlias, isRoomMember } from '../../lib/chat';
import { ConversationEvents, getConversationsBus } from '../channels-list/channels';
import { getHistory } from '../../lib/browser';
import { addRoomToSync, markConversationAsRead, openFirstConversation } from '../channels/saga';
import { translateJoinRoomApiError, parseAlias, isAlias, extractDomainFromAlias } from './utils';
import { joinRoom as apiJoinRoom } from './api';
import { startPollingPosts } from '../posts/saga';
import { allChannelsSelector, channelSelector } from '../channels/selectors';
import { EventChannel } from 'redux-saga';
import { MatrixInitializationError } from '../../lib/chat/matrix/errors';
import { PresencePoller } from '../../lib/chat/presence-poller';
import { isOneOnOne } from '../channels-list/utils';
import { config } from '../../config';

function* initChat(userId: string, token: string) {
  const history = yield call(getHistory);
  let chatConnection: EventChannel<unknown> | undefined;
  try {
    const {
      chatConnection: newChatConnection,
      connectionPromise,
      activate,
    } = createChatConnection(userId, token, chat.get());
    chatConnection = newChatConnection;
    const id = yield connectionPromise;
    if (id !== userId) {
      yield call(saveUserMatrixCredentials, id, 'not-used');
    }
    yield takeEvery(chatConnection, convertToBusEvents);
    yield spawn(activateWhenConversationsLoaded, activate);
  } catch (error) {
    // If we encounter this error, it means the matrix crypto store is essentially corrupted
    // and we need to clear everything and restart. The client handles resetting itself
    // we just need to reload the app.
    if (error instanceof MatrixInitializationError) {
      yield history.replace({ pathname: '/error' });
    }
  } finally {
    yield spawn(closeConnectionOnLogout, chatConnection);
  }
}

// Handles updating loading state while waiting for matrix to connect and the initial sync to complete
export function* waitForChatConnectionCompletion() {
  const isComplete = yield select((state) => state.chat.isChatConnectionComplete);
  if (isComplete) {
    return true;
  }

  yield put(setLoadingConversationProgress(5));

  const progressTracker = yield fork(function* () {
    for (let progress = 5; progress < 100; progress += 1.5) {
      yield delay(50);
      yield put(setLoadingConversationProgress(progress));
    }
  });

  const { complete } = yield race({
    complete: take(yield call(getChatBus), ChatEvents.ChatConnectionComplete),
    abort: take(yield call(getAuthChannel), AuthEvents.UserLogout),
  });

  yield cancel(progressTracker);

  if (complete) {
    yield put(setLoadingConversationProgress(100));
    yield delay(50);
    yield put(setIsChatConnectionComplete(true));
    return true;
  }

  yield put(setLoadingConversationProgress(100));
  return false;
}

function* convertToBusEvents(action) {
  const chatBus = yield call(getChatBus);
  yield put(chatBus, action);
}

function* connectOnLogin() {
  yield take(yield call(getAuthChannel), AuthEvents.UserLogin);
  const user = yield select(currentUserSelector);
  const userId = user.matrixId;
  const token = yield call(getSSOToken);

  yield initChat(userId, token.token);
}

function* closeConnectionOnLogout(chatConnection?: EventChannel<unknown> | undefined) {
  yield take(yield call(getAuthChannel), AuthEvents.UserLogout);
  if (chatConnection) {
    chatConnection.close();
  }
  yield spawn(connectOnLogin);
}

function* activateWhenConversationsLoaded(activate) {
  const isConversationsLoaded = yield select((state) => state.chat.isConversationsLoaded);
  if (isConversationsLoaded) {
    activate();
    return;
  }

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
  yield put(setIsConversationsLoaded(false));
}

function* addAdminUser() {
  yield put(receive({ userId: 'admin', firstName: 'Admin', profileImage: null, matrixId: 'admin' }));
}

// The selected conversation is managed via the URL
export function* setActiveConversation(id: string) {
  // Ignore empty or null IDs – nothing to route to.
  if (!id) {
    return;
  }

  const history = yield call(getHistory);
  const expectedPath = `/conversation/${id}`;
  if (history.location?.pathname !== expectedPath) {
    history.push({ pathname: expectedPath });
  }
}

export function* validateActiveConversation(conversationId: string) {
  try {
    yield put(clearJoinRoomErrorContent());
    yield put(setIsJoiningConversation(true));

    const isLoaded = yield call(waitForChatConnectionCompletion);
    if (isLoaded) {
      yield call(performValidateActiveConversation, conversationId);
    }
  } finally {
    yield put(setIsJoiningConversation(false));
  }
}

export function* joinRoom(roomIdOrAlias: string) {
  const { success, response } = yield call(apiJoinRoom, roomIdOrAlias);

  if (!success) {
    const domain = extractDomainFromAlias(roomIdOrAlias);

    const error = translateJoinRoomApiError(response, domain);

    yield put(setJoinRoomErrorContent(error));
    yield put(rawSetActiveConversationId(null));
  } else {
    yield put(clearJoinRoomErrorContent());
    yield call(setWhenUserJoinedRoom, response.roomId);
  }
}

export function* isMemberOfActiveConversation(activeConversationId) {
  const conversationList = yield select(allChannelsSelector);
  const isRoomInState = conversationList.includes(activeConversationId);
  if (isRoomInState) {
    return true;
  }

  // Check with the chat client just in case it knows better
  // This is a slower call which is why we check the state first.
  const user = yield select(currentUserSelector);
  const isMember = yield call(isRoomMember, user.matrixId, activeConversationId);
  return isMember;
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

let didSeedBaseTargets = false;
export function* setPresenceTargets(conversation) {
  if (!didSeedBaseTargets) {
    didSeedBaseTargets = true;
    const allChannels = yield select(allChannelsSelector);
    const allMembersUserIds = allChannels.filter(isOneOnOne).flatMap((channel) => channel?.otherMembers || []);
    const allMembersMatrixIds = allMembersUserIds.map((id) => `@${id}:${config.matrixHomeServerName}`);
    yield call(() => PresencePoller.setBaseTargets(allMembersMatrixIds));
  }

  const otherMembersMatrixIds = conversation?.otherMembers?.map((member) => member.matrixId) || [];
  yield call(() => PresencePoller.setActiveRoomMembers(otherMembersMatrixIds));
}

export function* performValidateActiveConversation(activeConversationId: string) {
  const history = yield call(getHistory);
  const currentPath = history.location.pathname;
  const isMessengerApp = currentPath.startsWith('/conversation');

  // Store the original path when validation starts
  const originalPath = currentPath;

  if (!activeConversationId) {
    const historyNow = yield call(getHistory);
    // If the browser is already pointing at a concrete /conversation/:id route, treat that as source of truth.
    if (/^\/conversation\/[^/]+/.test(historyNow.location.pathname)) {
      // No Redux id yet, but URL already has one – let the corresponding
      // messenger / channels app component fire the correct action.
      return;
    }

    yield put(clearJoinRoomErrorContent());
    yield call(openFirstConversation);
    return;
  }

  let conversationId = activeConversationId;
  if (isAlias(activeConversationId)) {
    activeConversationId = parseAlias(activeConversationId);
    conversationId = yield call(getRoomIdForAlias, activeConversationId);
  }

  const conversation = yield select(channelSelector(conversationId));
  if (conversation?.isSocialChannel && isMessengerApp) {
    // If it's a social channel and accessed from messenger app, open the last active conversation instead
    yield call(openFirstConversation);
    return;
  }

  if (!conversationId || !(yield call(isMemberOfActiveConversation, conversationId))) {
    yield call(joinRoom, activeConversationId);
    return;
  }

  const currentHistory = yield call(getHistory);
  const currentPathNow = currentHistory.location.pathname;
  const expectedPath = `/conversation/${conversationId}`;

  // If this conversation is unencrypted and validation started while the URL already pointed elsewhere,
  // skip re-applying the state so we don't override the user's navigation.
  if (conversation?.isEncrypted === false && originalPath !== expectedPath) {
    return;
  }

  // check if path has changed before setting active conversation
  if (currentPathNow === originalPath) {
    yield put(rawSetActiveConversationId(conversationId));

    // Set up the conversation with necessary initialization steps
    yield call(addRoomToSync, conversationId);
    yield call(startPollingPosts, conversationId);
    yield call(setPresenceTargets, conversation);
  }

  // Mark conversation as read, now that it has been set as active
  yield spawn(markConversationAsRead, conversationId);
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

  yield takeLatest(SagaActionTypes.ValidateFeedChat, ({ payload }: any) => validateActiveConversation(payload.id));

  const authBus = yield call(getAuthChannel);
  yield takeEveryFromBus(authBus, AuthEvents.UserLogout, clearOnLogout);
  yield takeEveryFromBus(authBus, AuthEvents.UserLogin, addAdminUser);

  yield takeLatest(SagaActionTypes.CloseConversationErrorDialog, closeErrorDialog);
}
