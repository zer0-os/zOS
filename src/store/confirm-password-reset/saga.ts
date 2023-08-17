import { confirmPasswordReset as confirmPasswordResetApi } from './api';
import { setLoading, setStage, setErrors, SagaActionTypes, ConfirmPasswordResetStage } from './index';
import { ConfirmPasswordResetErrors } from '.';
import { call, put, take, fork, cancel } from 'redux-saga/effects';

export function* confirmPasswordReset() {
  while (true) {
    const action = yield take(SagaActionTypes.UpdatePassword);
    yield put(setLoading(true));

    try {
      const result = yield call(confirmPasswordResetApi, action.payload);

      if (result.success) {
        yield put(setStage(ConfirmPasswordResetStage.Done));
        break;
      } else {
        yield put(setErrors([ConfirmPasswordResetErrors.UNKNOWN_ERROR]));
      }
    } catch (error: any) {
      yield put(setErrors([ConfirmPasswordResetErrors.UNKNOWN_ERROR]));
    } finally {
      yield put(setLoading(false));
    }
  }
}

export function* watchConfirmPasswordReset() {
  while (true) {
    yield take(SagaActionTypes.EnterConfirmPasswordResetPage);

    // set the stage back to the initial stage
    yield put(setStage(ConfirmPasswordResetStage.SubmitNewPassword));

    const task = yield fork(confirmPasswordReset);
    yield take(SagaActionTypes.LeaveConfirmPasswordResetPage);
    yield cancel(task);
  }
}

export function* saga() {
  yield watchConfirmPasswordReset();
}
