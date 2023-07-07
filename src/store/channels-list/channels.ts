import { multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';

// create 2 events: message loaded for channel, messages loaded for conversation
export enum ChannelEvents {
  MessagesLoadedForChannel = 'channel/messages/loaded',
  MessagesLoadedForConversation = 'conversation/messages/loaded',
}

let theConversationsChannel;
export function* conversationsChannel() {
  if (!theConversationsChannel) {
    theConversationsChannel = yield call(multicastChannel);
  }
  return theConversationsChannel;
}
