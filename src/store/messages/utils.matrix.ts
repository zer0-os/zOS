import { call } from 'redux-saga/effects';
import { getUsersByMatrixIds } from '../users/saga';
import { Message, MessageWithoutSender, isMessageWithoutSender } from '.';
import { User } from '../channels';

// takes in a list of messages, and maps the sender to a ZERO user for each message
// this is used to display the sender's name and profile image.
// This also ensures that the user is in redux, if they aren't, they're added.
export function* mapMessageSenders(messages: (Message | MessageWithoutSender)[]) {
  const matrixIds = messages
    .map((m) => {
      if (isMessageWithoutSender(m)) {
        return m.senderId;
      }
      return m.sender?.matrixId;
    })
    .filter(Boolean);
  const zeroUsers: Map<string, User> = yield call(getUsersByMatrixIds, matrixIds);

  return messages.map((message) => {
    let sender = message.sender;
    if (message.sender) {
      sender = zeroUsers.get(message.sender?.matrixId) || message.sender;
    }
    if (isMessageWithoutSender(message)) {
      sender = zeroUsers.get(message.senderId) || {
        userId: message.senderId,
        matrixId: message.senderId,
        firstName: '',
        lastName: '',
        profileImage: '',
        profileId: '',
        primaryZID: '',
      };
    }
    return { ...message, sender };
  });
}

export function* mapNotificationSenders(notifications) {
  if (!notifications?.length) return notifications;

  const usersByMatrixId = yield call(fetchMissingUserData, notifications);
  const notificationsWithSenders = mapSendersToNotifications(notifications, usersByMatrixId);

  return notificationsWithSenders;
}

function* fetchMissingUserData(notifications) {
  const matrixIds = notifications.map((n) => n.sender?.matrixId).filter(Boolean);
  const users: Map<string, User> = yield call(getUsersByMatrixIds, matrixIds);

  return users;
}

function mapSendersToNotifications(notifications, usersMap: Map<string, User>) {
  return notifications.map((notification) => ({
    ...notification,
    sender: usersMap.get(notification.sender?.matrixId) || notification.sender,
  }));
}
