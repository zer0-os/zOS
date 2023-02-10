import { RootState } from './../index';
import { takeLatest, put, call, delay } from 'redux-saga/effects';
import { SagaActionTypes, setActiveDirectMessageId, setDirectMessages, setSyncStatus } from '.';
import { AsyncListStatus } from '../normalized';
import { fetchDirectMessages, createDirectMessage as createDirectMessageApi } from './api';
import { select } from 'redux-saga-test-plan/matchers';
import { DirectMessage } from './types';

const FETCH_DIRECT_MESSAGE_INTERVAL = 60000;

const rawAsyncStatus = () => (state: RootState) => state.directMessages.syncStatus;

export function* fetch() {
  const directMessages = yield call(fetchDirectMessages);

  yield put(setDirectMessages(directMessages));
}

export function* createDirectMessage(action) {
  const { userIds } = action.payload;
  const directMessage: DirectMessage = yield call(createDirectMessageApi, userIds);

  if (directMessage && directMessage.id) {
    yield put(setActiveDirectMessageId(directMessage.id));
  }
}

export function* stopSyncDirectMessage() {
  yield put(setSyncStatus(AsyncListStatus.Stopped));
}

export function* startSyncDirectMessage() {
  while (String(yield select(rawAsyncStatus())) !== AsyncListStatus.Stopped) {
    yield call(fetch);
    yield delay(FETCH_DIRECT_MESSAGE_INTERVAL);
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.StartSyncDirectMessage, startSyncDirectMessage);
  yield takeLatest(SagaActionTypes.StopSyncDirectMessage, stopSyncDirectMessage);
  yield takeLatest(SagaActionTypes.CreateDirectMessage, createDirectMessage);
}
