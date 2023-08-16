import { requestPasswordReset as requestPasswordResetApi } from './api';
import { setLoading, setStage, setErrors, SagaActionTypes, RequestPasswordResetStage } from './index';
import { ResetPasswordErrors } from '.';
import { call, put, take, fork, cancel } from 'redux-saga/effects';

export function validateRequestPasswordResetEmail({ email }) {
  const validationErrors = [];
  if (!email || !email.trim()) {
    validationErrors.push(ResetPasswordErrors.EMAIL_REQUIRED);
  }
  return validationErrors;
}

export function* requestPasswordReset() {
  while (true) {
    const action = yield take(SagaActionTypes.RequestPasswordReset);
    yield put(setLoading(true));

    const validationErrors = validateRequestPasswordResetEmail(action.payload);

    if (validationErrors.length > 0) {
      yield put(setErrors(validationErrors));
      continue;
    }

    try {
      const result = yield call(requestPasswordResetApi, action.payload);

      if (result.success) {
        yield put(setStage(RequestPasswordResetStage.Done));
        break;
      } else {
        let errors = [];
        if (result.response === 'UNKNOWN_ERROR') {
          errors.push(ResetPasswordErrors.UNKNOWN_ERROR);
        }
        yield put(setErrors(errors));
      }
    } catch (error: any) {
      console.error(error);
      yield put(setErrors([ResetPasswordErrors.API_ERROR]));
    } finally {
      yield put(setLoading(false));
    }
  }
}

export function* watchRequestPasswordReset() {
  while (true) {
    yield take(SagaActionTypes.EnterRequesetPasswordResetPage);
    const task = yield fork(requestPasswordReset);
    yield take(SagaActionTypes.LeaveRequesetPasswordResetPage);
    yield cancel(task);
  }
}

export function* saga() {
  yield watchRequestPasswordReset();
}
