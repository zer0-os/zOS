import { resetPassword as resetPasswordApi } from './api';
import { setLoading, setErrors, SagaActionTypes, setEmailSubmitted } from './index';
import { ResetPasswordErrors } from '.';
import { call, put, take } from 'redux-saga/effects';

export function validateResetPassword({ email }) {
  const validationErrors = [];

  if (!email.trim()) {
    validationErrors.push(ResetPasswordErrors.EMAIL_REQUIRED);
  }

  return validationErrors;
}

export function* resetPasswordPage() {
  let success;
  do {
    const action = yield take(SagaActionTypes.ResetPassword);
    yield put(setLoading(true));
    yield put(setEmailSubmitted(false));

    const validationErrors = validateResetPassword(action.payload);

    if (validationErrors.length > 0) {
      yield put(setErrors(validationErrors));
      success = false;
      continue;
    }

    const result = yield call(resetPasswordApi, action.payload);
    success = result.success;

    if (success) {
      yield put(setEmailSubmitted(true));
    } else {
      yield put(setErrors([result.response]));
    }

    yield put(setLoading(false));
  } while (!success);
}

export function* saga() {
  yield resetPasswordPage();
}
