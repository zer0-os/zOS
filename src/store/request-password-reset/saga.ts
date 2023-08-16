import { requestPasswordReset as requestPasswordResetApi } from './api';
import { setLoading, setErrors, SagaActionTypes, setEmailSubmitted } from './index';
import { ResetPasswordErrors } from '.';
import { call, put, take } from 'redux-saga/effects';

export function validateRequestPasswordResetEmail({ email }) {
  const validationErrors = [];

  if (!email.trim()) {
    validationErrors.push(ResetPasswordErrors.EMAIL_REQUIRED);
  }

  return validationErrors;
}

export function* requestPasswordResetPage() {
  let success;
  do {
    const action = yield take(SagaActionTypes.RequestPasswordReset);
    yield put(setLoading(true));
    yield put(setEmailSubmitted(false));

    const validationErrors = validateRequestPasswordResetEmail(action.payload);

    if (validationErrors.length > 0) {
      yield put(setErrors(validationErrors));
      success = false;
      continue;
    }

    const result = yield call(requestPasswordResetApi, action.payload);
    success = result.success;

    if (success) {
      yield put(setEmailSubmitted(true));
    } else {
      let errors = [];
      if (result.response === 'EMAIL_NOT_FOUND') {
        errors.push(ResetPasswordErrors.EMAIL_NOT_FOUND);
      } else {
        errors.push(ResetPasswordErrors.UNKNOWN_ERROR);
      }
      yield put(setErrors(errors));
    }

    yield put(setLoading(false));
  } while (!success);
}

export function* saga() {
  yield requestPasswordResetPage();
}
