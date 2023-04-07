import { testSaga } from 'redux-saga-test-plan';

import { createConversation } from './saga';
import { setGroupCreating, setActive } from '.';

import { createConversation as performCreateConversation } from '../channels-list/saga';

describe('create conversation saga', () => {
  it('manages the conversation active state', async () => {
    // Note: temporary during migration
    return testSaga(createConversation, { payload: {} })
      .next()
      .put(setActive(true))
      .next()
      .next()
      .next()
      .next()
      .put(setActive(false));
  });

  it('manages the creating status while performing the actual create', async () => {
    const testPayload = {
      userId: 'test',
      name: 'test name',
      image: {},
    };

    return testSaga(createConversation, { payload: testPayload })
      .next()
      .next()
      .put(setGroupCreating(true))
      .next()
      .call(performCreateConversation, { payload: testPayload })
      .next()
      .put(setGroupCreating(false));
  });
});
