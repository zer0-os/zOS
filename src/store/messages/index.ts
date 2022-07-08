import { createAction } from '@reduxjs/toolkit';

import { createNormalizedSlice } from '../normalized';

export interface Message {
  id: string;
  name: string;
}

export enum SagaActionTypes {
  Fetch = 'messages/saga/fetch',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);
const slice = createNormalizedSlice({
  name: 'messages',
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { fetch };
