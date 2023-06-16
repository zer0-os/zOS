import { eventChannel, multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { chat } from '../../lib/chat';

export enum Events {
  MessageReceived = 'chat/message/received',
  MessageDeleted = 'chat/message/deleted',
  UnreadCountChanged = 'chat/message/unreadCountChanged',
  ReconnectStart = 'chat/recconectStart',
  ReconnectStop = 'chat/recconectStop',
}

let theBus;
export function* getChatBus() {
  if (!theBus) {
    theBus = yield call(multicastChannel);
  }
  return theBus;
}

// XXX
// this function creates an event channel from a given socket
// Setup subscription to incoming `ping` events
export function createChatConnection(config, userId, chatAccessToken) {
  return eventChannel((emit) => {
    const receiveNewMessage = (channelId, message) =>
      emit({ type: Events.MessageReceived, payload: { channelId, message } });
    const receiveDeleteMessage = (channelId, messageId) =>
      emit({ type: Events.MessageDeleted, payload: { channelId, messageId } });
    const receiveUnreadCount = (channelId, unreadCount) =>
      emit({ type: Events.UnreadCountChanged, payload: { channelId, unreadCount } });
    const reconnectStart = () => emit({ type: Events.ReconnectStart, payload: {} });
    const reconnectStop = () => emit({ type: Events.ReconnectStop, payload: {} });

    chat.initChat({
      reconnectStart,
      reconnectStop,
      receiveNewMessage,
      receiveDeleteMessage,
      receiveUnreadCount,
      invalidChatAccessToken: config.invalidChatAccessToken,
    });
    chat.connect(userId, chatAccessToken);

    const unsubscribe = () => {
      // XXX: Close the chat object and destroy?
    };
    return unsubscribe;
  });
}
