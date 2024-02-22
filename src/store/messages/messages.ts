import { multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';

export enum ChatMessageEvents {
  Sent = 'chat-message/sent',
}

let theChannel;
export function* getChatMessageBus() {
  if (!theChannel) {
    theChannel = yield call(multicastChannel);
  }
  return theChannel;
}
