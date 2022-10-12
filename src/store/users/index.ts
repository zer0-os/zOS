import { createAction } from '@reduxjs/toolkit';
import { createNormalizedSlice } from '../normalized';

import { Payload } from './saga';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  profileId: string;
  isOnline: Boolean;
  profileImage: string;
  lastSeenAt: string;
}

export enum SagaActionTypes {
  Fetch = 'users/saga/fetch',
}

const fetch = createAction<Payload>(SagaActionTypes.Fetch);

const slice = createNormalizedSlice({
  name: 'users',
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { fetch };
