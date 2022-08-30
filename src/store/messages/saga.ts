import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select } from 'redux-saga/effects';
import { SagaActionTypes } from '.';
import { receive } from '../channels';

import { fetchMessagesByChannelId } from './api';

export interface Payload {
  channelId: string;
  referenceTimestamp?: number;
}

const rawMessagesSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}].messages`, []);
};

export function* fetch(action) {
  const { channelId, referenceTimestamp } = action.payload;

  let messagesResponse: any;
  let messages: any[];
  let channelIdPrefix: string = 'sendbird_group_channel_' + channelId;

  if (referenceTimestamp) {
    const existingMessages = yield select(rawMessagesSelector(channelId));

    messagesResponse = yield call(fetchMessagesByChannelId, channelIdPrefix, referenceTimestamp);
    messages = [
      ...existingMessages,
      ...messagesResponse.messages,
    ];
  } else {
    messagesResponse = yield call(fetchMessagesByChannelId, channelIdPrefix);
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

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
