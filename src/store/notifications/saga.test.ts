import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { AsyncListStatus } from '../normalized';
import { rootReducer } from '..';

import { fetch } from './saga';
import { setStatus } from '.';
import { fetchNotifications } from './api';

describe('notifications list saga', () => {
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
    await expectSaga(fetch, { payload: {} })
      .provide([
        [
          matchers.call.fn(fetchNotifications),
          [],
        ],
      ])
      .call(fetchNotifications)
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
    const ids = [
      'id-1',
      'id-2',
      'id-3',
    ];
    const {
      storeState: { notificationsList },
    } = await expectSaga(fetch, { payload: {} })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(fetchNotifications),
          [
            { id: 'id-1', notificationType: 'type-1' },
            { id: 'id-2', notificationType: 'type-2' },
            { id: 'id-3', notificationType: 'type-3' },
          ],
        ],
      ])
      .run();

    expect(notificationsList.value).toStrictEqual(ids);
  });

  it('adds notifications to normalized state', async () => {
    const {
      storeState: { normalized },
    } = await expectSaga(fetch, { payload: {} })
      .provide([
        [
          matchers.call.fn(fetchNotifications),
          [
            { id: 'id-1', notificationType: 'type-1' },
            { id: 'id-2', notificationType: 'type-2' },
            { id: 'id-3', notificationType: 'type-3' },
          ],
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(normalized.notifications).toStrictEqual({
      'id-1': { id: 'id-1', notificationType: 'type-1' },
      'id-2': { id: 'id-2', notificationType: 'type-2' },
      'id-3': { id: 'id-3', notificationType: 'type-3' },
    });
  });
});
