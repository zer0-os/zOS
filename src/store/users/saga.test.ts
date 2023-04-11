import { expectSaga } from 'redux-saga-test-plan';
import { clearUsers } from './saga';

import { rootReducer } from '..';

describe('users saga', () => {
  it('removes the users', async () => {
    const users = { 'id-one': { id: 'id-one', name: 'this should be removed' } };
    const notifications = { 'id-two': { id: 'id-two', name: 'do not remove this one' } };

    const {
      storeState: { normalized },
    } = await expectSaga(clearUsers)
      .withReducer(rootReducer)
      .withState({
        normalized: { users, notifications },
      })
      .run(0);

    expect(normalized).toEqual({
      users: {},
      notifications,
    });
  });
});
