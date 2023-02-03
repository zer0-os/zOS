import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { setDirectMessages, reducer } from '.';
import { fetch, stopSyncDirectMessage } from './saga';
import { fetchDirectMessages } from './api';

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

  it('sets status to Stopped', async () => {
    const {
      storeState: { directMessages },
    } = await expectSaga(stopSyncDirectMessage).withReducer(rootReducer).run();

    expect(directMessages.syncStatus).toBe(AsyncListStatus.Stopped);
  });
});
