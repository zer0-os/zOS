import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { setDirectMessages } from '.';
import { fetch } from './saga';
import { fetchDirectMessages } from './api';

import directMessagesFixture from './direct-messages-fixture.json';

import { reducer } from '.';
import { DirectMessage } from './types';

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
});
