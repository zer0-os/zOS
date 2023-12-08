import { call, select } from 'redux-saga/effects';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';
import { getZeroUsersMap, messageSelector } from './saga';
import { chat } from '../../lib/chat';
import { userByMatrixIdSelector } from '../users/selectors';
import { currentUserSelector } from '../authentication/saga';

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
        // if we don't have the parent message in our list, we need to fetch it
        // this can happen when a message is a reply to a message which is not in the current page/list
        parentMessage = yield call([chatClient, chatClient.getMessageByRoomId], channelId, message.parentMessageId);
        parentMessage.sender = zeroUsersMap[parentMessage.sender?.userId] || parentMessage.sender;
      }

      message.parentMessage = parentMessage;
      message.parentMessageText = parentMessage.message;
    }
  }
}

// takes in a list of messages, and maps the sender to a ZERO user for each message
// this is used to display the sender's name and profile image
export function* mapMessageSenders(messages, channelId) {
  const zeroUsersMap = yield call(getZeroUsersMap);

  const matrixIds = [];
  for (const m of messages) {
    // it's possible that our "cache" doesn't have the sender because (s)he has left the room
    // in that case we need to record the Id, and fetch it's profile using the API
    if (m.sender?.userId && !zeroUsersMap[m.sender.userId]) {
      matrixIds.push(m.sender.userId);
    }
  }

  if (matrixIds.length) {
    const zeroUsers = yield call(getZEROUsersAPI, matrixIds);
    for (const user of zeroUsers) {
      zeroUsersMap[user.matrixId] = {
        userId: user.id,
        profileId: user.profileSummary?.id,
        firstName: user.profileSummary?.firstName,
        lastName: user.profileSummary?.lastName,
        profileImage: user.profileSummary?.profileImage,
      };
    }
  }

  messages.forEach((message) => {
    message.sender = zeroUsersMap[message.sender?.userId] || message.sender; // note: message.sender.userId is the matrixId
  });

  yield call(mapParentForMessages, messages, channelId, zeroUsersMap);
}

// maps a newly sent/received message sender + parentMessage to a ZERO user
export function* mapReceivedMessage(message) {
  const matrixId = message.sender?.userId;

  const currentUser = yield select(currentUserSelector());
  if (currentUser && matrixId === currentUser.matrixId) {
    message.sender = {
      userId: currentUser.id,
      profileId: currentUser.profileSummary?.id,
      firstName: currentUser.profileSummary?.firstName,
      lastName: currentUser.profileSummary?.lastName,
      profileImage: currentUser.profileSummary?.profileImage,
    };
  } else {
    const user = yield select(userByMatrixIdSelector, matrixId);
    message.sender = user || message.sender;
  }

  if (message.parentMessageId) {
    const parentMessage = yield select(messageSelector(message.parentMessageId));
    message.parentMessage = parentMessage || {};
    message.parentMessageText = parentMessage?.message;
  }
}
