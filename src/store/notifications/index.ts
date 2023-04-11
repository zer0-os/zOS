import { createAction } from '@reduxjs/toolkit';

import { createNormalizedListSlice, createNormalizedSlice, removeAll } from '../normalized';

import { Payload } from './saga';

export enum SagaActionTypes {
  Fetch = 'notifications/saga/fetch',
}

const fetch = createAction<Payload>(SagaActionTypes.Fetch);

const slice = createNormalizedSlice({
  name: 'notifications',
});
const { schema } = slice;

const listSlice = createNormalizedListSlice({
  name: 'notificationsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = listSlice.actions;
export const { reducer, normalize } = listSlice;

export { fetch, schema, removeAll };

export const relevantNotificationTypes = [
  'chat_channel_mention',
  'chat_channel_message_replied',
  'chat_dm_mention',
];

export function denormalizeNotifications(state) {
  return listSlice.denormalize(state.notificationsList.value, state);
}
