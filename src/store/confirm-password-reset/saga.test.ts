import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import { rootReducer } from '../reducer';
import { throwError } from 'redux-saga-test-plan/providers';

import { confirmPasswordReset, watchConfirmPasswordReset } from './saga';
import { confirmPasswordReset as confirmPasswordResetApi } from './api';
import {
  ConfirmPasswordResetErrors,
  ConfirmPasswordResetStage,
  initialState as initialConfirmPasswordState,
  ConfirmPasswordResetState,
  SagaActionTypes,
} from '.';

describe('confirmPasswordReset saga', () => {
  it('should call the API and handle success response', async () => {
    const token = 'sample_token';
    const password = 'sample_password';

    const {
      storeState: { confirmPasswordReset: confirmPasswordState },
    } = await expectSaga(confirmPasswordReset)
      .provide([
        [
          call(confirmPasswordResetApi, { token, password }),
          { success: true },
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .dispatch({ type: SagaActionTypes.UpdatePassword, payload: { token, password } })
      .run();

    expect(confirmPasswordState.stage).toEqual(ConfirmPasswordResetStage.Done);
    expect(confirmPasswordState.loading).toBeFalsy();
  });

  it('should call the API and handle UNKNOWN_ERROR response', async () => {
    const payload = { token: 'testToken', password: 'newPassword123' };

    const {
      storeState: { confirmPasswordReset: confirmPasswordState },
    } = await expectSaga(confirmPasswordReset)
      .provide([
        [
          call(confirmPasswordResetApi, { token: payload.token, password: payload.password }),
          { success: false, response: 'UNKNOWN_ERROR' },
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .dispatch({ type: SagaActionTypes.UpdatePassword, payload })
      .run({ silenceTimeout: true }); // Because this saga uses an infinite loop it will always timeout

    expect(confirmPasswordState.errors).toContain(ConfirmPasswordResetErrors.UNKNOWN_ERROR);
    expect(confirmPasswordState.loading).toBeFalsy();
  });

  it('should handle exceptions thrown by the API call', async () => {
    const payload = { token: 'testToken', password: 'newPassword123' };

    const {
      storeState: { confirmPasswordReset: confirmPasswordState },
    } = await expectSaga(confirmPasswordReset)
      .provide([
        [
          call(confirmPasswordResetApi, { token: payload.token, password: payload.password }),
          throwError(new Error('API error')),
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .dispatch({ type: SagaActionTypes.UpdatePassword, payload })
      .run({ silenceTimeout: true }); // Because this saga uses an infinite loop it will always timeout

    expect(confirmPasswordState.errors).toContain(ConfirmPasswordResetErrors.UNKNOWN_ERROR);
    expect(confirmPasswordState.loading).toBeFalsy();
  });

  describe('watchConfirmPasswordReset saga', () => {
    it('should reset the stage upon entering the reset page', async () => {
      const {
        storeState: { confirmPasswordReset: confirmPasswordState },
      } = await expectSaga(watchConfirmPasswordReset)
        .withReducer(rootReducer, initialState({ stage: ConfirmPasswordResetStage.Done }))
        .put({ type: 'confirm-password-reset/setStage', payload: ConfirmPasswordResetStage.SubmitNewPassword })
        .dispatch({ type: SagaActionTypes.EnterConfirmPasswordResetPage })
        .run({ silenceTimeout: true }); // Because this saga uses an infinite loop it will always timeout

      expect(confirmPasswordState.stage).toEqual(ConfirmPasswordResetStage.SubmitNewPassword);
    });
  });
});

function initialState(attrs: Partial<ConfirmPasswordResetState> = {}) {
  return {
    confirmPasswordReset: {
      ...initialConfirmPasswordState,
      ...attrs,
    },
  } as any;
}
