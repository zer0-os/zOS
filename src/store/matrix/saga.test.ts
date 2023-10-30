import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import { throwError } from 'redux-saga-test-plan/providers';

import { start } from './saga';
import { apiCall } from './api';
import { MatrixState, initialState as initialMatrixState } from '.';

import { rootReducer } from '../reducer';

describe('start', () => {
  it('makes api call', async () => {
    await expectSaga(start, { payload: {} })
      .provide([
        [
          call(apiCall, {}),
          { success: true, response: {} },
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .call(apiCall, {})
      .run();
  });
});

function initialState(attrs: Partial<MatrixState> = {}) {
  return {
    matrix: {
      ...initialMatrixState,
      ...attrs,
    },
  } as any;
}
