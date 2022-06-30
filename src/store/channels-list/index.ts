import { createAction } from '@reduxjs/toolkit';
import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';

export enum SagaActionTypes {
  Fetch = 'channelsList/saga/fetch',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus } = slice.actions;
export const { reducer, normalize, denormalize } = slice;
export { fetch };
