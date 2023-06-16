import { eventChannel, multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { chat } from '../../lib/chat';

export enum Events {
  MessageReceived = 'chat/message/received',
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
  // `eventChannel` takes a subscriber function
  // the subscriber function takes an `emit` argument to put messages onto the channel
  return eventChannel((emit) => {
    const receiveNewMessage = (channelId, message) => {
      // puts event payload into the channel
      // this allows a Saga to take this payload from the returned channel
      console.log('received new message in the event channel', channelId, message);
      emit({ type: Events.MessageReceived, payload: { channelId, message } });
    };

    const errorHandler = (errorEvent) => {
      // create an Error object and put it into the channel
      emit(new Error(errorEvent.reason));
    };

    chat.initChat({
      reconnectStart: config.reconnectStart,
      reconnectStop: config.reconnectStop,
      receiveNewMessage: receiveNewMessage,
      receiveDeleteMessage: config.receiveDeleteMessage,
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
