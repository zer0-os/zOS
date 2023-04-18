import { race, take } from 'redux-saga/effects';
import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { AsyncListStatus } from '../normalized';
import { rootReducer } from '../reducer';

import {
  addNotification,
  authWatcher,
  clearNotifications,
  createEventChannel,
  fetch,
  watchForChannelEvent,
} from './saga';
import { setStatus, relevantNotificationTypes, SagaActionTypes, relevantNotificationEvents } from '.';
import { fetchNotifications } from './api';
import { sample } from 'lodash';
import { authChannel } from '../authentication/saga';
import { multicastChannel } from 'redux-saga';

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

  it('watchForChannelEvent', () => {
    const userId = 'user-id';

    const notification = { id: 'notification-id', notificationType: sample(relevantNotificationTypes) };

    const notificationChannel = {
      take: jest.fn(),
      close: jest.fn(),
    };

    testSaga(watchForChannelEvent, userId)
      .next()
      .call(createEventChannel, userId)
      .next(notificationChannel)

      .next({ abort: undefined, notification })
      .call(addNotification, notification)
      .next()
      .inspect((raceValue) => {
        expect(raceValue).toStrictEqual(
          race({
            abort: take(SagaActionTypes.CancelEventWatch),
            notification: take(notificationChannel),
          })
        );
      })

      .next({ abort: true, notification: undefined })
      .inspect((returnValue) => {
        expect(notificationChannel.close).toBeCalled();
        expect(returnValue).toBeFalse();
      })

      .next()
      .isDone();
  });

  it('addNotification', async () => {
    const notification = { id: 'id-added', name: 'this one should be added to the top of the list' };

    const notificationsList = { value: ['id-old'] };
    const notifications = { 'id-old': { id: 'id-old', name: 'this one already existed' } };

    const {
      storeState: {
        normalized: { notifications: storeNotifications },
        notificationsList: storeNotificationsList,
      },
    } = await expectSaga(addNotification, notification)
      .withReducer(rootReducer)
      .withState({
        notificationsList,
        normalized: { notifications },
      })
      .run();

    expect(storeNotificationsList.value).toEqual([
      notification.id,
      ...notificationsList.value,
    ]);
    expect(storeNotifications).toStrictEqual({ ...{ [notification.id]: notification }, ...notifications });
  });

  it('authWatcher', async () => {
    const channel = multicastChannel();
    const userId = 'user-id';

    testSaga(authWatcher)
      .next()
      .call(authChannel)

      .next(channel)
      .inspect((action) => {
        const { payload } = action as any;

        expect(payload.channel).toEqual(channel);
        expect(payload.pattern).toEqual('*');
      })

      .next({ userId })
      .spawn(watchForChannelEvent, userId)

      .next(channel)
      .inspect((action) => {
        const { payload } = action as any;

        expect(payload.channel).toEqual(channel);
        expect(payload.pattern).toEqual('*');
      })

      .next({ userId: undefined })
      .inspect((action) => {
        expect(action).toEqual({ type: SagaActionTypes.CancelEventWatch });
      });
  });

  describe('createEventChannel', () => {
    const userId = 'user-id';

    const pusherClient = {
      init: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    it('disconnect', () => {
      const channel = createEventChannel(userId, pusherClient);

      channel.close();

      expect(pusherClient.disconnect).toBeCalled();
    });

    it('initializes', () => {
      createEventChannel(userId, pusherClient);

      const eventsExpectation = relevantNotificationEvents.map((event) => {
        return { key: event, callback: expect.anything() };
      });

      expect(pusherClient.init).toBeCalledWith(userId, eventsExpectation);
    });
  });
});
