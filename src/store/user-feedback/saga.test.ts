import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import { submitFeedback } from './saga';
import { submitUserFeedback as apiSubmitUserFeedback } from './api';
import { UserFeedbackState, initialState as initialUserFeedbackState } from '.';

import { rootReducer } from '../reducer';

describe('start', () => {
  it('makes api call', async () => {
    await expectSaga(submitFeedback, 'feedback')
      .provide([
        [
          call(apiSubmitUserFeedback, 'feedback'),
          { success: true, response: {} },
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .call(apiSubmitUserFeedback, {})
      .run();
  });
});

function initialState(attrs: Partial<UserFeedbackState> = {}) {
  return {
    userFeedback: {
      ...initialUserFeedbackState,
      ...attrs,
    },
  } as any;
}
