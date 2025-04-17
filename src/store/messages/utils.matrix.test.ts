import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import { mapMessageSenders, mapNotificationSenders } from './utils.matrix';
import { getUsersByMatrixIds } from '../users/saga';
import { Message } from '.';
import { User } from '../channels';

describe(mapMessageSenders, () => {
  let messages: Partial<Message>[];
  let usersMap: Map<string, User>;
  let user1: User;
  let user2: User;

  beforeEach(() => {
    user1 = {
      userId: 'user-1',
      matrixId: 'matrix-user-1',
      firstName: 'Test',
      lastName: 'User 1',
      profileImage: 'image-url-1',
      profileId: 'profile-1',
      isOnline: true,
      lastSeenAt: null, // Keep as null (valid string | null)
      primaryZID: 'zid-1',
    };
    user2 = {
      userId: 'user-2',
      matrixId: 'matrix-user-2',
      firstName: 'Test',
      lastName: 'User 2',
      profileImage: 'image-url-2',
      profileId: 'profile-2',
      isOnline: false,
      lastSeenAt: new Date().toISOString(), // Use ISO string
      primaryZID: 'zid-2',
    };

    // Setup usersMap
    usersMap = new Map<string, User>();
    usersMap.set(user1.matrixId, user1);
    usersMap.set(user2.matrixId, user2);

    messages = [
      {
        id: '1',
        message: 'message-1',
        sender: {
          matrixId: 'matrix-user-1',
          userId: 'matrix-user-1',
          firstName: '',
          lastName: '',
          profileImage: '',
          profileId: '',
          primaryZID: '',
        },
        createdAt: 0,
      },
      {
        id: '2',
        message: 'message-2',
        sender: {
          matrixId: 'matrix-user-2',
          userId: 'matrix-user-2',
          firstName: '',
          lastName: '',
          profileImage: '',
          profileId: '',
          primaryZID: '',
        },
        createdAt: 1,
      },
      {
        id: '3',
        message: 'message-3',
        sender: {
          matrixId: 'matrix-user-unknown',
          userId: 'matrix-user-unknown',
          firstName: 'Unknown',
          lastName: '',
          profileImage: '',
          profileId: '',
          primaryZID: '',
        },
        createdAt: 2,
      },
    ];
  });

  it('maps message senders using ZERO user data from getUsersByMatrixIds', async () => {
    const matrixIdsToFetch = ['matrix-user-1', 'matrix-user-2', 'matrix-user-unknown'];
    // Only return users we know
    const foundUsersMap = new Map<string, User>([
      [user1.matrixId, user1],
      [user2.matrixId, user2],
    ]);

    const result = await expectSaga(mapMessageSenders, messages as Message[])
      .provide([[call(getUsersByMatrixIds, matrixIdsToFetch), foundUsersMap]])
      .run();

    expect(result.returnValue[0].sender).toEqual(user1);
    expect(result.returnValue[1].sender).toEqual(user2);
  });

  it('keeps original sender data if ZERO user is not found', async () => {
    const matrixIdsToFetch = ['matrix-user-1', 'matrix-user-2', 'matrix-user-unknown'];
    const originalUnknownSender = messages[2].sender;
    // Only return users we know
    const foundUsersMap = new Map<string, User>([
      [user1.matrixId, user1],
      [user2.matrixId, user2],
    ]);

    const result = await expectSaga(mapMessageSenders, messages as Message[])
      .provide([[call(getUsersByMatrixIds, matrixIdsToFetch), foundUsersMap]])
      .run();

    expect(result.returnValue[2].sender).toEqual(originalUnknownSender); // Should remain unchanged
  });

  it('handles empty message array', async () => {
    const emptyMessages: Message[] = [];
    const result = await expectSaga(mapMessageSenders, emptyMessages)
      // No call to getUsersByMatrixIds should be made if messages array is empty
      .run();

    expect(result.returnValue).toEqual([]);
  });

  it('handles messages with missing sender matrixId', async () => {
    const messagesWithMissingSender = [
      { ...messages[0] }, // Has sender.matrixId
      {
        id: '4',
        message: 'message-4',
        sender: { userId: 'no-matrix-id' }, // No matrixId
        createdAt: 3,
      },
    ];
    const matrixIdsToFetch = ['matrix-user-1']; // Only user1's matrixId should be fetched
    const foundUsersMap = new Map<string, User>([[user1.matrixId, user1]]);
    const originalSenderNoMatrixId = messagesWithMissingSender[1].sender;

    const result = await expectSaga(mapMessageSenders, messagesWithMissingSender as Message[])
      .provide([[call(getUsersByMatrixIds, matrixIdsToFetch), foundUsersMap]])
      .run();

    expect(result.returnValue[0].sender).toEqual(user1);
    expect(result.returnValue[1].sender).toEqual(originalSenderNoMatrixId); // Should remain unchanged
  });
});

describe(mapNotificationSenders, () => {
  // Assuming Notification type structure, adjust if needed
  interface TestNotification {
    id: string;
    content: { body: string };
    sender: {
      matrixId?: string;
      userId?: string;
      firstName?: string;
    };
    // other notification fields
  }

  let notifications: TestNotification[];
  let usersMap: Map<string, User>;
  let user1: User;
  let user2: User;

  beforeEach(() => {
    // Re-use user setup from mapMessageSenders tests or define specific ones
    user1 = {
      userId: 'user-1',
      matrixId: 'matrix-user-1',
      firstName: 'Test',
      lastName: 'User 1',
      profileImage: 'image-url-1',
      profileId: 'profile-1',
      isOnline: true,
      lastSeenAt: null, // Keep as null
      primaryZID: 'zid-1',
    };
    user2 = {
      userId: 'user-2',
      matrixId: 'matrix-user-2',
      firstName: 'Test',
      lastName: 'User 2',
      profileImage: 'image-url-2',
      profileId: 'profile-2',
      isOnline: false,
      lastSeenAt: new Date().toISOString(), // Use ISO string
      primaryZID: 'zid-2',
    };

    usersMap = new Map<string, User>();
    usersMap.set(user1.matrixId, user1);
    usersMap.set(user2.matrixId, user2);

    notifications = [
      { id: '1', content: { body: 'notification 1' }, sender: { matrixId: 'matrix-user-1', firstName: '' } },
      { id: '2', content: { body: 'notification 2' }, sender: { matrixId: 'matrix-user-2', firstName: '' } },
      {
        id: '3',
        content: { body: 'notification 3' },
        sender: { matrixId: 'matrix-user-unknown', firstName: 'Unknown' },
      },
    ];
  });

  it('maps notification senders using ZERO user data from getUsersByMatrixIds', async () => {
    const matrixIdsToFetch = ['matrix-user-1', 'matrix-user-2', 'matrix-user-unknown'];
    const foundUsersMap = new Map<string, User>([
      [user1.matrixId, user1],
      [user2.matrixId, user2],
    ]);

    const { returnValue } = await expectSaga(mapNotificationSenders, notifications)
      .provide([[call(getUsersByMatrixIds, matrixIdsToFetch), foundUsersMap]])
      .run();

    expect(returnValue[0].sender).toEqual(user1);
    expect(returnValue[1].sender).toEqual(user2);
  });

  it('keeps original sender data if ZERO user is not found', async () => {
    const matrixIdsToFetch = ['matrix-user-1', 'matrix-user-2', 'matrix-user-unknown'];
    const originalUnknownSender = notifications[2].sender;
    const foundUsersMap = new Map<string, User>([
      [user1.matrixId, user1],
      [user2.matrixId, user2],
    ]);

    const { returnValue } = await expectSaga(mapNotificationSenders, notifications)
      .provide([[call(getUsersByMatrixIds, matrixIdsToFetch), foundUsersMap]])
      .run();

    expect(returnValue[2].sender).toEqual(originalUnknownSender);
  });

  it('returns original array if notifications array is empty or undefined', async () => {
    let result = await expectSaga(mapNotificationSenders, []).run();
    expect(result.returnValue).toEqual([]);

    result = await expectSaga(mapNotificationSenders, undefined).run();
    expect(result.returnValue).toBeUndefined();
  });

  it('handles notifications with missing sender matrixId', async () => {
    const notificationsWithMissingSender = [
      { ...notifications[0] }, // Has sender.matrixId
      { id: '4', content: { body: 'notification 4' }, sender: { userId: 'no-matrix-id' } }, // No matrixId
    ];
    const matrixIdsToFetch = ['matrix-user-1']; // Only fetch user1
    const foundUsersMap = new Map<string, User>([[user1.matrixId, user1]]);
    const originalSenderNoMatrixId = notificationsWithMissingSender[1].sender;

    const { returnValue } = await expectSaga(mapNotificationSenders, notificationsWithMissingSender)
      .provide([[call(getUsersByMatrixIds, matrixIdsToFetch), foundUsersMap]])
      .run();

    expect(returnValue[0].sender).toEqual(user1);
    expect(returnValue[1].sender).toEqual(originalSenderNoMatrixId);
  });
});
