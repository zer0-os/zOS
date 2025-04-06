import { takeLatest, put, call } from 'redux-saga/effects';
import { checkServerStatus as checkServerStatusApi } from './api';
import { setMaintenanceStatus, SagaActionTypes } from '.';

export function* checkServerStatus() {
  try {
    const { isInMaintenance } = yield call(checkServerStatusApi);
    yield put(setMaintenanceStatus(isInMaintenance));
  } catch (error) {
    console.error('Error checking server status:', error);
    // If we can't reach the server, don't assume it's in maintenance
    // This prevents false positives when there are network issues
    yield put(setMaintenanceStatus(false));
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.CheckServerStatus, checkServerStatus);
}
