import { createAction } from '@reduxjs/toolkit';

import { createNormalizedListSlice, createNormalizedSlice } from '../normalized';

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
export const { reducer, normalize, denormalize } = listSlice;

export { fetch };
