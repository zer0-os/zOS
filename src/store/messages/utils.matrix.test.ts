import { expectSaga } from 'redux-saga-test-plan';

import { mapMessageSenders, mapNotificationSenders } from './utils.matrix';
import { getZEROUsers } from '../channels-list/api';
import { StoreBuilder } from '../test/store';
import { rootReducer } from '../reducer';
import { call } from 'redux-saga/effects';
import { getLocalZeroUsersMap } from './saga';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';
import { batchDownloadFiles } from '../../lib/chat';

describe(mapMessageSenders, () => {
  let messages: any;
  let users: any;

  beforeEach(() => {
    users = [
      {
        userId: 'user-1',
        matrixId: 'matrix-user-1',
        firstName: 'Test',
        lastName: 'User 1',
        profileImage: 'image-url-1',
      },
      {
        userId: 'user-2',
        matrixId: 'matrix-user-2',
        firstName: 'Test',
        lastName: 'User 2',
        profileImage: 'image-url-2',
      },
    ];

    messages = [
      { id: 1, message: 'message-1', sender: { userId: 'matrix-user-1', firstName: '' } },
      { id: 2, message: 'message-2', sender: { userId: 'matrix-user-2', firstName: '' } },
    ];
  });

  it('replaces local data with actual ZERO user data', async () => {
    const messages = [
      { id: 1, message: 'message-1', sender: { userId: 'matrix-user-1', firstName: '' } },
    ];
    const initialState = new StoreBuilder().withUsers({ userId: 'user-id-1', firstName: 'my test name' });

    await expectSaga(mapMessageSenders, messages, 'channel-id')
      .provide([
        [
          call(getZEROUsers, ['matrix-user-1']),
          [
            {
              userId: 'zero-user-id',
              matrixId: 'matrix-user-1',
              firstName: 'First name',
              lastName: 'Last name',
              profileId: 'profile-id',
              profileImage: 'image-url',
            },
          ],
        ],
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(messages[0].sender).toEqual({
      userId: 'zero-user-id',
      matrixId: 'matrix-user-1',
      firstName: 'First name',
      lastName: 'Last name',
      profileId: 'profile-id',
      profileImage: 'image-url',
    });
  });

  it('maps message senders to ZERO users if present in state', async () => {
    const initialState = {
      normalized: {
        users: {
          'user-1': users[0],
          'user-2': users[1],
        },
      },
    };

    await expectSaga(mapMessageSenders, messages, 'channel-id').withState(initialState).run();

    expect(messages[0].sender).toEqual({
      userId: 'user-1',
      matrixId: 'matrix-user-1',
      firstName: 'Test',
      lastName: 'User 1',
      profileImage: 'image-url-1',
    });
    expect(messages[1].sender).toEqual({
      userId: 'user-2',
      matrixId: 'matrix-user-2',
      firstName: 'Test',
      lastName: 'User 2',
      profileImage: 'image-url-2',
    });
  });
});

describe(mapNotificationSenders, () => {
  let notifications;
  let users;

  beforeEach(() => {
    users = [
      {
        userId: 'user-1',
        matrixId: 'matrix-user-1',
        firstName: 'Test',
        lastName: 'User 1',
        profileImage: 'mxc://image-url-1',
        profileId: 'profile-1',
      },
      {
        userId: 'user-2',
        matrixId: 'matrix-user-2',
        firstName: 'Test',
        lastName: 'User 2',
        profileImage: 'mxc://image-url-2',
        profileId: 'profile-2',
      },
    ];

    notifications = [
      { id: '1', content: { body: 'notification 1' }, sender: { userId: 'matrix-user-1', firstName: '' } },
      { id: '2', content: { body: 'notification 2' }, sender: { userId: 'matrix-user-2', firstName: '' } },
    ];
  });

  it('replaces local data with actual ZERO user data and downloads profile images', async () => {
    const notifications = [
      { id: '1', content: { body: 'notification 1' }, sender: { userId: 'matrix-user-1', firstName: '' } },
    ];
    const initialState = new StoreBuilder().withUsers({ userId: 'user-id-1', firstName: 'my test name' });

    const { returnValue } = await expectSaga(mapNotificationSenders, notifications)
      .provide([
        [call(getLocalZeroUsersMap), {}],
        [
          call(getZEROUsersAPI, ['matrix-user-1']),
          [
            {
              userId: 'zero-user-id',
              matrixId: 'matrix-user-1',
              firstName: 'First name',
              lastName: 'Last name',
              profileId: 'profile-id',
              profileImage: 'mxc://image-url',
            },
          ],
        ],
        [call(batchDownloadFiles, ['mxc://image-url'], true), { 'mxc://image-url': 'downloaded-image-url' }],
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(returnValue[0].sender).toEqual({
      userId: 'zero-user-id',
      matrixId: 'matrix-user-1',
      firstName: 'First name',
      lastName: 'Last name',
      profileId: 'profile-id',
      profileImage: 'downloaded-image-url',
    });
  });

  it('maps notification senders to ZERO users if present in state', async () => {
    const initialState = {
      normalized: {
        users: {
          'user-1': users[0],
          'user-2': users[1],
        },
      },
    };

    const { returnValue } = await expectSaga(mapNotificationSenders, notifications)
      .provide([
        [
          call(getLocalZeroUsersMap),
          {
            'matrix-user-1': users[0],
            'matrix-user-2': users[1],
          },
        ],
        [
          call(batchDownloadFiles, ['mxc://image-url-1', 'mxc://image-url-2'], true),
          {
            'mxc://image-url-1': 'downloaded-url-1',
            'mxc://image-url-2': 'downloaded-url-2',
          },
        ],
      ])
      .withState(initialState)
      .run();

    expect(returnValue[0].sender).toEqual({
      ...users[0],
      profileImage: 'downloaded-url-1',
    });
    expect(returnValue[1].sender).toEqual({
      ...users[1],
      profileImage: 'downloaded-url-2',
    });
  });
});
