import { takeLatest, put, call, select } from 'redux-saga/effects';
import { SagaActionTypes } from '.';
import { receive, denormalize } from '../channels';

import { fetchMessagesByChannelId, MessagesFilter } from './api';

export interface Payload {
  channelId: string;
  filter?: MessagesFilter;
}

const getState = (state) => state;

export function* fetch(action) {
  const { channelId, filter } = action.payload;

  const messagesResponse = yield call(fetchMessagesByChannelId, channelId, filter);

  const state = yield select(getState);
  const channel = denormalize(channelId, state) || null;
  const prevMessages = channel?.messages || [];
  const messages = messagesResponse.messages.concat(prevMessages);

  yield put(receive({ id: channelId, ...messagesResponse, messages }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
