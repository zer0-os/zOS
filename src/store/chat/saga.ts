import { put, select, call, take, takeEvery, spawn } from 'redux-saga/effects';
import { takeEveryFromBus } from '../../lib/saga';
import getDeepProperty from 'lodash.get';

import { setReconnecting } from '.';
import { unreadCountUpdated } from '../channels';
import { startChannelsAndConversationsAutoRefresh } from '../channels-list';
import { Events, createChatConnection, getChatBus } from './bus';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';

export function* saga() {
  yield spawn(connectOnLogin);

  // XXX: These should be in the approriate places...messages?
  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, Events.UnreadCountChanged, listenForUnreadCountChanges);
  yield takeEveryFromBus(chatBus, Events.ReconnectStart, listenForReconnectStart);
  yield takeEveryFromBus(chatBus, Events.ReconnectStop, listenForReconnectStop);
}

function* listenForUnreadCountChanges(action) {
  yield put(unreadCountUpdated(action.payload));
}

function* listenForReconnectStart(_action) {
  yield put(setReconnecting(true));
}

function* listenForReconnectStop(_action) {
  yield put(setReconnecting(false));
  // XXX: do we need to start the whole polling here or just do a single one?
  // after reconnecting fetch (latest) channels and conversations *immediately*.
  // (instead of waiting for the "regular refresh interval to kick in")
  yield put(startChannelsAndConversationsAutoRefresh());
}

// XXX: Where do we want to put this stuff?
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
  const userId = yield select((state) => getDeepProperty(state, 'authentication.user.data.id', null));
  const chatAccessToken = yield select((state) => getDeepProperty(state, 'chat.chatAccessToken.value', null));

  if (!userId || !chatAccessToken) {
    yield spawn(connectOnLogin); // Wait again
  }

  yield initChat(userId, chatAccessToken);
}

function* closeConnectionOnLogout(chatConnection) {
  yield take(yield call(getAuthChannel), AuthEvents.UserLogout);
  chatConnection.close();
  yield spawn(connectOnLogin);
}
