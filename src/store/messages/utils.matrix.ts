import { call } from 'redux-saga/effects';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';
import { getLocalZeroUsersMap } from './saga';
import { isFileUploadedToMatrix } from '../../lib/chat/matrix/media';
import { batchDownloadFiles } from '../../lib/chat';

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

export function* mapNotificationSenders(notifications) {
  if (!notifications?.length) return notifications;

  const localUsersMap = yield call(getLocalZeroUsersMap);
  const updatedUsersMap = yield call(fetchMissingUserData, notifications, localUsersMap);
  const notificationsWithSenders = mapSendersToNotifications(notifications, updatedUsersMap);
  const notificationsWithImages = yield call(updateProfileImages, notificationsWithSenders);

  return notificationsWithImages;
}

function* fetchMissingUserData(notifications, localUsersMap) {
  const missingMatrixIds = getMissingMatrixIds(notifications, localUsersMap);

  if (missingMatrixIds.length) {
    const zeroUsers = yield call(getZEROUsersAPI, missingMatrixIds);
    zeroUsers.forEach((user) => {
      localUsersMap[user.matrixId] = user;
    });
  }

  return localUsersMap;
}

function getMissingMatrixIds(notifications, localUsersMap) {
  return notifications
    .filter((notification) => notification.sender?.userId && !localUsersMap[notification.sender.userId])
    .map((notification) => notification.sender.userId);
}

function mapSendersToNotifications(notifications, usersMap) {
  return notifications.map((notification) => ({
    ...notification,
    sender: usersMap[notification.sender?.userId] || notification.sender,
  }));
}

function* updateProfileImages(notifications) {
  const profileImageUrlsMap = getProfileImageUrlsMap(notifications);

  if (Object.keys(profileImageUrlsMap).length > 0) {
    const downloadedImages = yield call(batchDownloadFiles, Object.keys(profileImageUrlsMap), true);
    return updateNotificationsWithDownloadedImages(notifications, downloadedImages);
  }

  return notifications;
}

function getProfileImageUrlsMap(notifications) {
  return notifications.reduce((map, notification) => {
    if (notification.sender?.profileImage && isFileUploadedToMatrix(notification.sender.profileImage)) {
      map[notification.sender.profileImage] = notification.sender.userId;
    }
    return map;
  }, {});
}

function updateNotificationsWithDownloadedImages(notifications, downloadedImages) {
  return notifications.map((notification) => {
    if (notification.sender?.profileImage && downloadedImages[notification.sender.profileImage]) {
      return {
        ...notification,
        sender: {
          ...notification.sender,
          profileImage: downloadedImages[notification.sender.profileImage],
        },
      };
    }
    return notification;
  });
}
