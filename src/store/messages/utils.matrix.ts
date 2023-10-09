import { call } from 'redux-saga/effects';
import { featureFlags } from '../../lib/feature-flags';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';
import { getZeroUsersMap } from './saga';

// takes in a list of messages, and maps the sender to a ZERO user for each message
// this is used to display the sender's name and profile image
export function* mapMessageSenders(messages) {
  if (!featureFlags.enableMatrix) {
    return;
  }

  const zeroUsersMap = yield call(getZeroUsersMap);

  const matrixIds = [];
  for (const m of messages) {
    // it's possible that our "cache" doesn't have the sender because (s)he has left the room
    // in that case we need to record the Id, and fetch it's profile using the API
    if (m.sender?.userId && !zeroUsersMap[m.sender.userId]) {
      matrixIds.push(m.sender.userId);
    }
  }

  if (!matrixIds.length) {
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
    message.sender = zeroUsersMap[message.sender?.userId] || message.sender;
  });
}
