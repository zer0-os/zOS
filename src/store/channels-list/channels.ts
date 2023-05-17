import { multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';

let theConversationsChannel;
export function* conversationsChannel() {
  if (!theConversationsChannel) {
    theConversationsChannel = yield call(multicastChannel);
  }
  return theConversationsChannel;
}
