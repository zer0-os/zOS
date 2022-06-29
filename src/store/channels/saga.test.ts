import { expectSaga } from 'redux-saga-test-plan';

import { connect } from './saga';

import { ConnectionStatus, setStatus } from '.';

describe('channels saga', () => {
  it('sets status to connecting', async () => {
    await expectSaga(connect, { payload: '0x000000000000000000000000000000000000000A' })
      .put(setStatus(ConnectionStatus.Connecting))
      .run();
  });
});
