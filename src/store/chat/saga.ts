import { put, select, call, take, takeEvery, spawn, race } from 'redux-saga/effects';
import { takeEveryFromBus } from '../../lib/saga';

import { setActiveChannelId, setReconnecting, setactiveConversationId } from '.';
import { startChannelsAndConversationsAutoRefresh } from '../channels-list';
import { Events, createChatConnection, getChatBus } from './bus';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { getSSOToken } from '../authentication/api';
import { currentUserSelector } from '../authentication/saga';
import { saveUserMatrixCredentials } from '../edit-profile/saga';
import { chat } from '../../lib/chat';
import { ConversationEvents, getConversationsBus } from '../channels-list/channels';

function* listenForReconnectStart(_action) {
  yield put(setReconnecting(true));
}

function* listenForReconnectStop(_action) {
  yield put(setReconnecting(false));
  // after reconnecting fetch (latest) channels and conversations *immediately*.
  // (instead of waiting for the "regular refresh interval to kick in")
  yield put(startChannelsAndConversationsAutoRefresh());
}

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
  yield put(setActiveChannelId(null));
  yield put(setactiveConversationId(null));
}

export function* saga() {
  yield spawn(connectOnLogin);
  yield takeEveryFromBus(yield call(getAuthChannel), AuthEvents.UserLogout, clearOnLogout);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, Events.ReconnectStart, listenForReconnectStart);
  yield takeEveryFromBus(chatBus, Events.ReconnectStop, listenForReconnectStop);
}
