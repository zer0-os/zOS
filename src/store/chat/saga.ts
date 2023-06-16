import { takeLatest, put, takeLeading, select, call, take } from 'redux-saga/effects';
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
  yield call(listenForChatEvents);
}

function* listenForChatEvents() {
  const chatBus = yield call(getChatBus);
  // XXX: Make a busTakeEvery?
  while (true) {
    console.log('waiting for bus event');
    const newMessageEvent = yield take(chatBus, Events.MessageReceived);
    console.log('got a bus event');
    const { channelId, message } = newMessageEvent.payload;
    yield put(receiveNewMessage({ channelId, message }));
  }
}

// XXX: Where do we want to put this stuff?
// XXX: Convert into saga events
function* initChat(action) {
  console.log('initialize chat the saga way');
  const { config } = action.payload;
  // XXX: Do the magic get prop deep thing
  const userId = yield select((state) => state.authentication.user.data.id);
  const chatAccessToken = yield select((state) => state.chat.chatAccessToken.value);

  const chatConnection = createChatConnection(config, userId, chatAccessToken);

  const chatBus = yield call(getChatBus);
  // XXX: listens to everything...then translate?
  while (true) {
    try {
      // An error from socketChannel will cause the saga jump to the catch block
      // XXX: takeEvery work here?
      const payload = yield take(chatConnection);
      console.log('got a payload', payload);
      yield put(chatBus, payload);
      // yield put({ type: INCOMING_PONG_PAYLOAD, payload })
      // yield fork(pong, socket)
    } catch (err) {
      console.error('chat error:', err);
      // socketChannel is still open in catch block
      // if we want end the socketChannel, we need close it explicitly
      // socketChannel.close()
    }
  }
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
