import { takeLatest, put, call, select } from 'redux-saga/effects';
import { SagaActionTypes } from '.';
import { receive, denormalize } from '../channels';

import { fetchMessagesByChannelId } from './api';

export interface Payload {
  channelId: string;
  referenceTimestamp?: number;
}

const getState = (state) => state;

export function* fetch(action) {
  const { channelId, referenceTimestamp } = action.payload;

  let messagesResponse: any;

  if (referenceTimestamp) {
    messagesResponse = yield call(fetchMessagesByChannelId, channelId, referenceTimestamp);
  } else {
    messagesResponse = yield call(fetchMessagesByChannelId, channelId);
  }

  const state = yield select(getState);
  const channel = denormalize(channelId, state) || null;
  const prevMessages = channel?.messages || [];
  const messages = messagesResponse.messages.concat(prevMessages);

  yield put(receive({ id: channelId, ...messagesResponse, messages }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
