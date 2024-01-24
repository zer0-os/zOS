import { multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';

export enum ConversationEvents {
  ConversationsLoaded = 'conversations/loaded',
  UserJoinedConversation = 'conversations/user-joined-conversation',
}

let theConversationsChannel;
export function* getConversationsBus() {
  if (!theConversationsChannel) {
    theConversationsChannel = yield call(multicastChannel);
  }
  return theConversationsChannel;
}
