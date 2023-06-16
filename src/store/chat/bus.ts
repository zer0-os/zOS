import { eventChannel, multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { chat } from '../../lib/chat';

export enum Events {
  MessageReceived = 'chat/message/received',
  MessageDeleted = 'chat/message/deleted',
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

    // XXX: what are the published error events?
    // const errorHandler = (errorEvent) => {
    //   // create an Error object and put it into the channel
    //   emit(new Error(errorEvent.reason));
    // };

    chat.initChat({
      reconnectStart: config.reconnectStart,
      reconnectStop: config.reconnectStop,
      receiveNewMessage,
      receiveDeleteMessage,
      receiveUnreadCount: config.receiveUnreadCount,
      invalidChatAccessToken: config.invalidChatAccessToken,
    });
    chat.connect(userId, chatAccessToken);

    const unsubscribe = () => {
      // XXX: Close the chat object and destroy?
    };
    return unsubscribe;
  });
}
