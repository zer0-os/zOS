import { call } from 'redux-saga/effects';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';
import { getLocalZeroUsersMap } from './saga';

// takes in a list of messages, and maps the sender to a ZERO user for each message
// this is used to display the sender's name and profile image
export function* mapMessageSenders(messages, _channelId) {
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

  return localUsersMap;
}
