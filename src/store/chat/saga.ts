import { put, select, call, take, takeEvery, spawn } from 'redux-saga/effects';
import { takeEveryFromBus } from '../../lib/saga';
import getDeepProperty from 'lodash.get';

import { setActiveChannelId, setReconnecting, setactiveConversationId } from '.';
import { startChannelsAndConversationsAutoRefresh } from '../channels-list';
import { Events, createChatConnection, getChatBus } from './bus';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { featureFlags } from '../../lib/feature-flags';
import { config } from '../../config';

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
  const chatConnection = createChatConnection(userId, chatAccessToken);
  yield takeEvery(chatConnection, convertToBusEvents);

  yield spawn(closeConnectionOnLogout, chatConnection);
}

function* convertToBusEvents(action) {
  const chatBus = yield call(getChatBus);
  yield put(chatBus, action);
}

function* connectOnLogin() {
  yield take(yield call(getAuthChannel), AuthEvents.UserLogin);
  let userId, chatAccessToken;
  // Might want this higher up and just set the state to better values?
  if (featureFlags.enableMatrix) {
    userId = config.matrix.userId;
    chatAccessToken = config.matrix.accessToken;
  } else {
    userId = yield select((state) => getDeepProperty(state, 'authentication.user.data.id', null));
    chatAccessToken = yield select((state) => getDeepProperty(state, 'chat.chatAccessToken.value', null));
  }

  yield initChat(userId, chatAccessToken);
}

function* closeConnectionOnLogout(chatConnection) {
  yield take(yield call(getAuthChannel), AuthEvents.UserLogout);
  chatConnection.close();
  yield spawn(connectOnLogin);
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
