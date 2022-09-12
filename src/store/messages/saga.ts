import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, delay } from 'redux-saga/effects';
import { SagaActionTypes } from '.';
import { receive } from '../channels';
import { channelIdPrefix } from '../channels-list/saga';

import { fetchMessagesByChannelId } from './api';

export interface Payload {
  channelId: string;
  referenceTimestamp?: number;
}

const rawMessagesSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}].messages`, []);
};

const FETCH_CHAT_CHANNEL_INTERVAL = 10000;

export function* fetch(action) {
  const { channelId, referenceTimestamp } = action.payload;

  let messagesResponse: any;
  let messages: any[];
  const channelPrefix: string = channelIdPrefix + channelId;

  if (referenceTimestamp) {
    const existingMessages = yield select(rawMessagesSelector(channelId));

    messagesResponse = yield call(fetchMessagesByChannelId, channelPrefix, referenceTimestamp);
    messages = [
      ...existingMessages,
      ...messagesResponse.messages,
    ];
  } else {
    messagesResponse = yield call(fetchMessagesByChannelId, channelPrefix);
    messages = messagesResponse.messages;
  }

  yield put(
    receive({
      id: channelId,
      messages,
      hasMore: messagesResponse.hasMore,
    })
  );
}

function* syncChannelsTask(action) {
  while (true) {
    yield call(fetch, action);
    yield delay(FETCH_CHAT_CHANNEL_INTERVAL);
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
  yield takeLatest(SagaActionTypes.startMessageSync, syncChannelsTask);
}
