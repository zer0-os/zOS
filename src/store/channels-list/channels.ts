import { multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';

export enum ChannelEvents {
  MessagesLoadedForChannel = 'channel/messages/loaded',
}

let theConversationsChannel;
export function* conversationsChannel() {
  if (!theConversationsChannel) {
    theConversationsChannel = yield call(multicastChannel);
  }
  return theConversationsChannel;
}
