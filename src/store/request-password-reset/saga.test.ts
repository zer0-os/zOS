import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import { rootReducer } from '../reducer';
import { throwError } from 'redux-saga-test-plan/providers';

import { requestPasswordReset, validateRequestPasswordResetEmail, watchRequestPasswordReset } from './saga';
import { requestPasswordReset as requestPasswordResetApi } from './api';
import {
  RequestPasswordResetErrors,
  RequestPasswordResetStage,
  initialState as initialResetPasswordState,
  RequestPasswordResetState,
} from '.';

describe('requestPasswordReset saga', () => {
  it('should validate the email and set EMAIL_REQUIRED error if email is empty', async () => {
    const email = '';
    const {
      storeState: { requestPasswordReset: requestPasswordState },
    } = await expectSaga(requestPasswordReset)
      .provide([
        [
          call(validateRequestPasswordResetEmail, { email }),
          [RequestPasswordResetErrors.EMAIL_REQUIRED],
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .dispatch({ type: 'requestPasswordReset', payload: { email } })
      .run();

    expect(requestPasswordState.errors).toContain(RequestPasswordResetErrors.EMAIL_REQUIRED);
  });

  it('should call the API and handle success response', async () => {
    const email = 'test@example.com';

    const {
      storeState: { requestPasswordReset: requestPasswordState },
    } = await expectSaga(requestPasswordReset)
      .provide([
        [
          call(requestPasswordResetApi, { email }),
          { success: true },
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .dispatch({ type: 'requestPasswordReset', payload: { email } })
      .run();

    expect(requestPasswordState.stage).toEqual(RequestPasswordResetStage.Done);
    expect(requestPasswordState.loading).toBeFalsy();
  });

  it('should call the API and handle UNKNOWN_ERROR response', async () => {
    const email = 'test@example.com';

    const {
      storeState: { requestPasswordReset: requestPasswordState },
    } = await expectSaga(requestPasswordReset)
      .provide([
        [
          call(requestPasswordResetApi, { email }),
          { success: false, response: 'UNKNOWN_ERROR' },
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .dispatch({ type: 'requestPasswordReset', payload: { email } })
      .run();

    expect(requestPasswordState.errors).toContain(RequestPasswordResetErrors.UNKNOWN_ERROR);
    expect(requestPasswordState.loading).toBeFalsy();
  });

  it('should handle exceptions thrown by the API call', async () => {
    const email = 'test@example.com';

    const {
      storeState: { requestPasswordReset: requestPasswordState },
    } = await expectSaga(requestPasswordReset)
      .provide([
        [
          call(requestPasswordResetApi, { email }),
          throwError(new Error('API error')),
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .dispatch({ type: 'requestPasswordReset', payload: { email } })
      .run();

    expect(requestPasswordState.errors).toContain(RequestPasswordResetErrors.API_ERROR);
    expect(requestPasswordState.loading).toBeFalsy();
  });
});

describe('watchRequestPasswordReset saga', () => {
  it('should reset the stage upon entering the reset page', async () => {
    const {
      storeState: { requestPasswordReset: requestPasswordState },
    } = await expectSaga(watchRequestPasswordReset)
      .withReducer(rootReducer, initialState({ stage: RequestPasswordResetStage.Done }))
      .put({ type: 'request-password-reset/setStage', payload: RequestPasswordResetStage.SubmitEmail })
      .dispatch({ type: 'enterRequestPasswordResetPage' })
      .run();

    expect(requestPasswordState.stage).toEqual(RequestPasswordResetStage.SubmitEmail);
  });
});

function initialState(attrs: Partial<RequestPasswordResetState> = {}) {
  return {
    requestPasswordReset: {
      ...initialResetPasswordState,
      ...attrs,
    },
  } as any;
}
