import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import { resetPasswordPage } from './saga';
import { ResetPasswordErrors } from '.';
import { resetPassword as resetPasswordApi } from './api';
import { setLoading, setErrors, setEmailSubmitted, SagaActionTypes } from './index';

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
      .put(setEmailSubmitted(true))
      .put(setLoading(false))
      .dispatch({ type: SagaActionTypes.ResetPassword, payload: { email } })
      .run();
  });

  //   it('sets error state if email validation fails', async () => {
  //     const email = '';

  //     await expectSaga(resetPasswordPage)
  //       .put(setLoading(true))
  //       .put(setEmailSubmitted(false))
  //       .put(setErrors([ResetPasswordErrors.EMAIL_REQUIRED]))
  //       .put(setLoading(false))
  //       .dispatch({ type: SagaActionTypes.ResetPassword, payload: { email } })
  //       .run();
  //   });

  it('sets error state if reset password fails', async () => {
    const email = 'test@example.com';
    const responseCode = 'error_code';

    await expectSaga(resetPasswordPage)
      .provide([
        [
          call(resetPasswordApi, { email }),
          { success: false, response: responseCode },
        ],
      ])
      .put(setErrors([responseCode]))
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
