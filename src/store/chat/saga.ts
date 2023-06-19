import { put, select, call, take, takeEvery, fork, spawn } from 'redux-saga/effects';
import { setReconnecting } from '.';
import { unreadCountUpdated } from '../channels';
import { receiveDeleteMessage, receiveNewMessage } from '../messages';

import { startChannelsAndConversationsAutoRefresh } from '../channels-list';
import { Events, createChatConnection, getChatBus } from './bus';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';

export function* saga() {
  yield spawn(connectOnLogin);

  // XXX: These should be in the approriate places...messages?
  yield fork(listenForNewMessage);
  yield fork(listenForDeleteMessage);
  yield fork(listenForUnreadCountChanges);
  yield fork(listenForReconnectStart);
  yield fork(listenForReconnectStop);
}

function* listenForNewMessage() {
  const chatBus = yield call(getChatBus);
  // XXX: Make a busTakeEvery?
  while (true) {
    const newMessageEvent = yield take(chatBus, Events.MessageReceived);
    const { channelId, message } = newMessageEvent.payload;
    yield put(receiveNewMessage({ channelId, message }));
  }
}

function* listenForDeleteMessage() {
  const chatBus = yield call(getChatBus);
  while (true) {
    const action = yield take(chatBus, Events.MessageDeleted);
    const { channelId, messageId } = action.payload;
    yield put(receiveDeleteMessage({ channelId, messageId }));
  }
}

function* listenForUnreadCountChanges() {
  const chatBus = yield call(getChatBus);
  while (true) {
    const action = yield take(chatBus, Events.UnreadCountChanged);
    yield put(unreadCountUpdated(action.payload));
  }
}

function* listenForReconnectStart() {
  const chatBus = yield call(getChatBus);
  while (true) {
    yield take(chatBus, Events.ReconnectStart);
    yield put(setReconnecting(true));
  }
}

function* listenForReconnectStop() {
  const chatBus = yield call(getChatBus);
  while (true) {
    yield take(chatBus, Events.ReconnectStop);
    yield put(setReconnecting(false));
    // XXX: do we need to start the whole polling here or just do a single one?
    // after reconnecting fetch (latest) channels and conversations *immediately*.
    // (instead of waiting for the "regular refresh interval to kick in")
    yield put(startChannelsAndConversationsAutoRefresh());
  }
}

// XXX: Where do we want to put this stuff?
function* initChat() {
  // XXX: Do the magic get prop deep thing
  const userId = yield select((state) => state.authentication.user.data.id);
  const chatAccessToken = yield select((state) => state.chat.chatAccessToken.value);

  const chatConnection = createChatConnection(userId, chatAccessToken);
  yield takeEvery(chatConnection, convertToBusEvents);
  yield spawn(closeConnectionOnLogout, chatConnection);
}

function* convertToBusEvents(action) {
  const chatBus = yield call(getChatBus);
  yield put(chatBus, action);
}

function* connectOnLogin() {
  const authChannel = yield call(getAuthChannel);
  yield take(authChannel, AuthEvents.UserLogin);
  yield initChat();
}

function* closeConnectionOnLogout(chatConnection) {
  const authChannel = yield call(getAuthChannel);
  yield take(authChannel, AuthEvents.UserLogout);

  chatConnection.close();
  yield spawn(connectOnLogin);
}
