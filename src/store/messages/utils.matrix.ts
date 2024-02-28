import { call, select } from 'redux-saga/effects';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';
import { getLocalZeroUsersMap, messageSelector } from './saga';
import { chat } from '../../lib/chat';

function* mapParentForMessages(messages, channelId: string, zeroUsersMap) {
  const chatClient = yield call(chat.get);

  const messagesById = {};
  messages.forEach((m) => {
    messagesById[m.id] = m;
  });

  for (const message of messages) {
    if (message.parentMessageId) {
      let parentMessage = messagesById[message.parentMessageId];
      if (!parentMessage) {
        // Check the state for the message
        parentMessage = yield select(messageSelector(message.parentMessageId));
      }

      if (!parentMessage) {
        // if we don't have the parent message in our list or in state we need to fetch it
        // this can happen when a message is a reply to a message which is not in the current page/list
        parentMessage = yield call([chatClient, chatClient.getMessageByRoomId], channelId, message.parentMessageId);
        parentMessage.sender = zeroUsersMap[parentMessage.sender?.userId] || parentMessage.sender;
      }

      message.parentMessage = parentMessage;
      message.parentMessageText = parentMessage.isHidden ? 'Message hidden' : parentMessage.message;
    }
  }
}

// takes in a list of messages, and maps the sender to a ZERO user for each message
// this is used to display the sender's name and profile image
export function* mapMessageSenders(messages, channelId) {
  const localUsersMap = yield call(getLocalZeroUsersMap);

  const matrixIds = [];
  for (const m of messages) {
    // it's possible that our "cache" doesn't have the sender because they have left the room
    // in that case we need to record the Id, and fetch it's profile using the API
    if (m.sender?.userId && !localUsersMap[m.sender.userId]) {
      matrixIds.push(m.sender.userId);
    }
  }

  if (matrixIds.length) {
    const zeroUsers = yield call(getZEROUsersAPI, matrixIds);
    zeroUsers.forEach((u) => (localUsersMap[u.matrixId] = u));
  }

  messages.forEach((message) => {
    message.sender = localUsersMap[message.sender?.userId] || message.sender; // note: message.sender.userId is the matrixId
  });

  yield call(mapParentForMessages, messages, channelId, localUsersMap);

  return localUsersMap;
}
