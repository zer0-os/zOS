import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import { resetPasswordPage } from './saga';
import { resetPassword as resetPasswordApi } from './api';
import { setLoading, setErrors, setEmailSubmitted, SagaActionTypes } from './index';
import { ResetPasswordErrors } from '.';

describe('resetPasswordPage', () => {
  it('successfully submits email for password reset', async () => {
    const email = 'test@example.com';

    await expectSaga(resetPasswordPage)
      .provide([
        [
          call(resetPasswordApi, { email }),
          { success: true },
        ],
      ])
      .put(setLoading(true))
      .put(setEmailSubmitted(true))
      .put(setLoading(false))
      .dispatch({ type: SagaActionTypes.ResetPassword, payload: { email } })
      .run();
  });

  it('sets error state if email not found', async () => {
    const email = 'test@example.com';

    await expectSaga(resetPasswordPage)
      .provide([
        [
          call(resetPasswordApi, { email }),
          { success: false, response: 'EMAIL_NOT_FOUND' },
        ],
      ])
      .put(setLoading(true))
      .put(setErrors([ResetPasswordErrors.EMAIL_NOT_FOUND]))
      .put(setLoading(false))
      .dispatch({ type: SagaActionTypes.ResetPassword, payload: { email } })
      .run();
  });

  it('sets error state if reset password fails with unknown error', async () => {
    const email = 'test@example.com';

    await expectSaga(resetPasswordPage)
      .provide([
        [
          call(resetPasswordApi, { email }),
          { success: false, response: 'UNKNOWN_ERROR' },
        ],
      ])
      .put(setLoading(true))
      .put(setErrors([ResetPasswordErrors.UNKNOWN_ERROR]))
      .put(setLoading(false))
      .dispatch({ type: SagaActionTypes.ResetPassword, payload: { email } })
      .run();
  });

  it('sets loading state correctly', async () => {
    const email = 'test@example.com';

    await expectSaga(resetPasswordPage)
      .provide([
        [
          call(resetPasswordApi, { email }),
          { success: true },
        ],
      ])
      .put(setLoading(true))
      .put(setLoading(false))
      .dispatch({ type: SagaActionTypes.ResetPassword, payload: { email } })
      .run();
  });
});
