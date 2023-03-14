import { takeLatest, put, call } from 'redux-saga/effects';

import { AsyncListStatus } from '../normalized';

import { SagaActionTypes, receive, setStatus } from '.';
import { fetchNotifications } from './api';

export interface Payload {
  notificationType: string;
  data: object;
  originUser: {
    id: string;
    profileSummary: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage: string;
    };
  };
}

export function* fetch(_action) {
  yield put(setStatus(AsyncListStatus.Fetching));

  const notifications = yield call(fetchNotifications);

  yield put(receive(notifications));

  yield put(setStatus(AsyncListStatus.Idle));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
