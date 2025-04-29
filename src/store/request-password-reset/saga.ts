import { requestPasswordReset as requestPasswordResetApi } from './api';
import { setLoading, setStage, setErrors, SagaActionTypes, RequestPasswordResetStage } from './index';
import { RequestPasswordResetErrors } from '.';
import { call, put, take, fork, cancel } from 'redux-saga/effects';

export function validateRequestPasswordResetEmail({ email }) {
  const validationErrors: RequestPasswordResetErrors[] = [];
  if (!email || !email.trim()) {
    validationErrors.push(RequestPasswordResetErrors.EMAIL_REQUIRED);
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
        yield put(setErrors([RequestPasswordResetErrors.UNKNOWN_ERROR]));
      }
    } catch (error: any) {
      yield put(setErrors([RequestPasswordResetErrors.API_ERROR]));
    } finally {
      yield put(setLoading(false));
    }
  }
}

export function* watchRequestPasswordReset() {
  while (true) {
    yield take(SagaActionTypes.EnterRequestPasswordResetPage);

    // set the stage back to the initial stage
    yield put(setStage(RequestPasswordResetStage.SubmitEmail));

    const task = yield fork(requestPasswordReset);
    yield take(SagaActionTypes.LeaveRequestPasswordResetPage);
    yield cancel(task);
  }
}

export function* saga() {
  yield watchRequestPasswordReset();
}
