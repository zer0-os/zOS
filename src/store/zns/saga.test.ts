import { expectSaga } from 'redux-saga-test-plan';

import { setRoute } from './saga';
import { reducer } from '.';

describe('zns saga', () => {
  it('should set route in state', async () => {
    const route = 'the.route.yo';

    await expectSaga(setRoute, { payload: route })
      .withReducer(reducer)
      .hasFinalState({ value: { route } })
      .run();
  });
});
