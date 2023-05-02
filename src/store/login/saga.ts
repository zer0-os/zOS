import { call, put, take } from 'redux-saga/effects';

import { emailLogin as apiEmailLogin } from './api';
import { EmailLoginErrors, LoginStage, SagaActionTypes, setErrors, setLoading, setStage } from '.';

export function* emailLogin(action) {
  const { email, password } = action.payload;

  yield put(setLoading(true));
  yield put(setErrors([]));
  try {
    const validationErrors = yield call(validateEmailLogin, { email, password });
    if (validationErrors.length) {
      yield put(setErrors(validationErrors));
      return false;
    }

    const result = yield call(apiEmailLogin, { email, password });
    if (result.success) {
      yield put(setStage(LoginStage.Done));
      return true;
    } else {
      yield put(setErrors([result.response]));
    }
  } catch (e) {
    yield put(setErrors([EmailLoginErrors.UNKNOWN_ERROR]));
  } finally {
    yield put(setLoading(false));
  }
  return false;
}

export function validateEmailLogin({ email, password }) {
  const validationErrors = [];

  if (!email.trim()) {
    validationErrors.push(EmailLoginErrors.EMAIL_REQUIRED);
  }

  if (!password.trim()) {
    validationErrors.push(EmailLoginErrors.PASSWORD_REQUIRED);
  }

  return validationErrors;
}

export function* saga() {
  let success;
  do {
    const action = yield take(SagaActionTypes.EmailLogin);
    success = yield call(emailLogin, action);
  } while (!success);
}
