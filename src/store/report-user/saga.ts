import { call, delay, put, select, takeLatest } from 'redux-saga/effects';
import {
  SagaActionTypes,
  setErrorMessage,
  setIsReportUserModalOpen,
  setLoading,
  setReportedUserId,
  setSuccessMessage,
} from '.';

import { reportUser as apiReportUser } from './api';

export function* reset() {
  yield put(setLoading(false));
  yield put(setErrorMessage(''));
  yield put(setSuccessMessage(''));
}

export function* reportUser(action) {
  yield call(reset);
  yield put(setLoading(true));

  try {
    const { reason, comment } = action.payload;
    const reportedUserId = yield select((state) => state.reportUser.reportedUserId);

    const response = yield call(apiReportUser, {
      reportedUserId,
      reason,
      comment: comment || '',
    });

    if (response.success) {
      yield put(setSuccessMessage('User reported successfully'));
      yield put(setLoading(false));

      yield delay(1000);
      yield call(closeReportUserModal);
    } else {
      yield put(setErrorMessage(response.error));
    }
  } catch (error) {
    yield put(setErrorMessage('An error occurred while reporting the user'));
  } finally {
    yield put(setLoading(false));
  }
}

export function* openReportUserModal(action) {
  yield put(setIsReportUserModalOpen(true));
  yield put(setReportedUserId(action.payload.reportedUserId));
}

export function* closeReportUserModal() {
  yield put(setIsReportUserModalOpen(false));
  yield call(reset);
  yield put(setReportedUserId(''));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.ReportUser, reportUser);
  yield takeLatest(SagaActionTypes.OpenReportUserModal, openReportUserModal);
  yield takeLatest(SagaActionTypes.CloseReportUserModal, closeReportUserModal);
}
