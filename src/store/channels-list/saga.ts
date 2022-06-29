import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setStatus, Status } from '.';
import { api } from './api';

export function* fetch(action) {
  yield call(api.fetch, action.payload);
  yield put(setStatus(Status.Fetching));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
