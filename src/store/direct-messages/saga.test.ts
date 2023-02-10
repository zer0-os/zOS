import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { setDirectMessages, reducer } from '.';
import { createDirectMessage, fetch, stopSyncDirectMessage } from './saga';
import { fetchDirectMessages, createDirectMessage as createDirectMessageApi } from './api';

import directMessagesFixture from './direct-messages-fixture.json';
import { rootReducer } from '..';
import { DirectMessage } from './types';
import { AsyncListStatus } from '../normalized';

export const DIRECT_MESSAGES_TEST = directMessagesFixture as unknown as DirectMessage[];

describe('direct messages saga', () => {
  it('fetch direct messages', async () => {
    const { storeState } = await expectSaga(fetch)
      .provide([
        [
          matchers.call.fn(fetchDirectMessages),
          directMessagesFixture,
        ],
      ])
      .call(fetchDirectMessages)
      .put(setDirectMessages(DIRECT_MESSAGES_TEST))
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      list: DIRECT_MESSAGES_TEST,
    });
  });

  it('create direct messages', async () => {
    const userIds = ['7867766_7876Z2'];
    await expectSaga(createDirectMessage, { payload: { userIds } })
      .provide([
        [
          matchers.call.fn(createDirectMessageApi),
          directMessagesFixture,
        ],
      ])
      .withReducer(rootReducer)
      .call(createDirectMessageApi, userIds)
      .run();
  });

  it('sets status to Stopped', async () => {
    const {
      storeState: { directMessages },
    } = await expectSaga(stopSyncDirectMessage).withReducer(rootReducer).run();

    expect(directMessages.syncStatus).toBe(AsyncListStatus.Stopped);
  });
});
