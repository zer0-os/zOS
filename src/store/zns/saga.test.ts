import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { setRoute } from './saga';
import { setRoute as appSandboxSetRoute } from '../../app-sandbox/store/zns';
import { reducer } from '.';
import { dispatch } from '../../app-sandbox/store';

describe('zns saga', () => {
  it('should set route in state', async () => {
    const route = 'the.route.yo';

    await expectSaga(setRoute, { payload: route })
      .withReducer(reducer)
      .hasFinalState({ value: { route } })
      .run();
  });

  it('should dispatch route to app sandbox', async () => {
    const route = 'the.route.yo';

    await expectSaga(setRoute, { payload: route })
      .provide([ matchers.call.fn(dispatch) ])
      .call(dispatch, appSandboxSetRoute(route))
      .withReducer(reducer)
      .run();
  });
});
