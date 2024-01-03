import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { AsyncListStatus } from '../normalized';
import { rootReducer } from '../reducer';

import { clearNotifications, fetch } from './saga';
import { setStatus, relevantNotificationTypes } from '.';
import { fetchNotifications } from './api';
import { sample } from 'lodash';

describe('notifications list saga', () => {
  const notificationFetchResponse = [
    { id: 'id-1', notificationType: sample(relevantNotificationTypes) },
    { id: 'id-2', notificationType: sample(relevantNotificationTypes) },
    { id: 'id-3', notificationType: sample(relevantNotificationTypes) },
  ];

  it('sets status to fetching', async () => {
    await expectSaga(fetch, { payload: {} })
      .put(setStatus(AsyncListStatus.Fetching))
      .provide([
        [
          matchers.call.fn(fetchNotifications),
          [],
        ],
      ])
      .run();
  });

  it('fetches notifications', async () => {
    await expectSaga(fetch, { payload: { userId: 'user-id' } })
      .provide([
        [
          matchers.call.fn(fetchNotifications),
          [],
        ],
      ])
      .call(fetchNotifications, 'user-id')
      .run();
  });

  it('sets status to Idle', async () => {
    const {
      storeState: { notificationsList },
    } = await expectSaga(fetch, { payload: {} })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(fetchNotifications),
          [],
        ],
      ])
      .run();

    expect(notificationsList.status).toBe(AsyncListStatus.Idle);
  });

  it('adds notification ids to notificationsList state', async () => {
    const {
      storeState: { notificationsList },
    } = await expectSaga(fetch, { payload: {} })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(fetchNotifications),
          notificationFetchResponse,
        ],
      ])
      .run();

    expect(notificationsList.value).toStrictEqual(
      notificationFetchResponse.map((n) => {
        return n.id;
      })
    );
  });

  it('adds notifications to normalized state', async () => {
    const {
      storeState: { normalized },
    } = await expectSaga(fetch, { payload: {} })
      .provide([
        [
          matchers.call.fn(fetchNotifications),
          notificationFetchResponse,
        ],
      ])
      .withReducer(rootReducer)
      .run();

    const expectation = notificationFetchResponse.reduce(
      (o, { id, notificationType }) => ({ ...o, [id]: { id, notificationType } }),
      {}
    );

    expect(normalized.notifications).toStrictEqual(expectation);
  });

  it('removes the notification list and notifications', async () => {
    const notificationsList = { value: 'id-one' };
    const notifications = { 'id-one': { id: 'id-one', name: 'this should be removed' } };
    const channels = { 'id-two': { id: 'id-two', name: 'do not remove this one' } };

    const {
      storeState: { normalized, notificationsList: notificationsListResult },
    } = await expectSaga(clearNotifications)
      .withReducer(rootReducer)
      .withState({
        notificationsList,
        normalized: { notifications, channels },
      })
      .run(0);

    expect(normalized).toEqual({
      notifications: {},
      channels,
    });

    expect(notificationsListResult).toEqual({ value: [] });
  });
});
