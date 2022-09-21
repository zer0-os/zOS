import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select } from 'redux-saga/effects';
import { SagaActionTypes } from '.';
import { receive } from '../channels';
import { channelIdPrefix } from '../channels-list/saga';

import { fetchMessagesByChannelId, sendMessagesByChannelId } from './api';

export interface Payload {
  channelId: string;
  referenceTimestamp?: number;
}

export interface SendPayload {
  channelId?: string;
  message?: string;
  mentionedUser?: string;
}

const rawMessagesSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}].messages`, []);
};

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

export function* send(action) {
  const { channelId, message, mentionedUser } = action.payload;

  yield call(sendMessagesByChannelId, channelId, message, mentionedUser);

  yield call(fetch, { payload: { channelId } });
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
  yield takeLatest(SagaActionTypes.Send, send);
}
