import { takeLatest, put, takeLeading, select, call, take, takeEvery, fork } from 'redux-saga/effects';
import { SagaActionTypes, setReconnecting } from '.';
import { unreadCountUpdated } from '../channels';
import { receiveDeleteMessage, receiveNewMessage } from '../messages';

import { chat } from '../../lib/chat';
import { startChannelsAndConversationsAutoRefresh } from '../channels-list';
import { Events, createChatConnection, getChatBus } from './bus';
import { getAuthChannel } from '../authentication/channels';

export function* receiveIsReconnecting(action) {
  yield put(setReconnecting(action.payload));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.ReceiveIsReconnecting, receiveIsReconnecting);
  // XXX: should do on login event
  yield takeLeading(SagaActionTypes.StartChat, initChat);

  // XXX: These should be in the approriate places...messages?
  yield fork(listenForNewMessage);
  yield fork(listenForDeleteMessage);
  yield fork(listenForUnreadCountChanges);
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
    console.log('waiting for bus delete', Events.MessageDeleted);
    const action = yield take(chatBus, Events.MessageDeleted);
    console.log('got a bus delete', action);
    const { channelId, messageId } = action.payload;
    yield put(receiveDeleteMessage({ channelId, messageId }));
  }
}

function* listenForUnreadCountChanges() {
  const chatBus = yield call(getChatBus);
  while (true) {
    console.log('waiting for event', Events.UnreadCountChanged);
    const action = yield take(chatBus, Events.UnreadCountChanged);
    yield put(unreadCountUpdated(action.payload));
  }
}

// XXX: Where do we want to put this stuff?
// XXX: Convert into saga events
function* initChat(action) {
  const { config } = action.payload;
  // XXX: Do the magic get prop deep thing
  const userId = yield select((state) => state.authentication.user.data.id);
  const chatAccessToken = yield select((state) => state.chat.chatAccessToken.value);

  const chatConnection = createChatConnection(config, userId, chatAccessToken);
  yield takeEvery(chatConnection, convertToBusEvents);
}

function* convertToBusEvents(action) {
  // XXX: error handling...what do we want to do.
  // There shouldn't be any here because it's all the other places that handle things?
  console.log('bus event!');
  const chatBus = yield call(getChatBus);
  console.log('publish on bus', action);
  yield put(chatBus, action);
}

// function reconnectStart() {
//   console.log('reconnect start event?');
//   receiveIsReconnecting(true);
// }

// function reconnectStop() {
//   console.log('reconnect stop event?');
//   receiveIsReconnecting(false);
//   // after reconnecting fetch (latest) channels and conversations *immediately*.
//   // (instead of waiting for the "regular refresh interval to kick in")
//   console.log('forcing reconnect');
//   startChannelsAndConversationsAutoRefresh();
// }

// function receiveDeleteMessageRaw(channelId: string, messageId: number) {
//   receiveDeleteMessage({ channelId, messageId });
// }

// function receiveUnreadCount(channelId: string, unreadCount: number) {
//   unreadCountUpdated({ channelId, unreadCount });
// }

// function invalidChatAccessToken() {
//   // XXX: Is this actually right? Feels like... we should log out properly or something?
//   //  updateConnector(Connectors.None);
// }
