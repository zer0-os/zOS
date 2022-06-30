import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setStatus, receiveNormalized, normalize } from '.';

import { api } from './api';
import { AsyncListStatus } from '../normalized';

import { receiveNormalized as receiveChannels } from '../channels';

export function* fetch(action) {
  yield put(setStatus(AsyncListStatus.Fetching));

  const channels = yield call(api.fetch, action.payload);

  const { result, entities } = normalize(channels);

  yield put(receiveNormalized(result));
  yield put(receiveChannels(entities));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
