import { Payload } from './saga';
import { createAction } from '@reduxjs/toolkit';

import { createNormalizedSlice } from '../normalized';

interface Sender {
  userId: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  profileId: string;
}

export interface MessagesResponse {
  hasMore: boolean;
  messages: Message[];
}

export interface Message {
  id: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  sender: Sender[];
  // TODO: type to be defined
  mentionedUsers: any;
  hidePreview: boolean;
  // TODO: type to be defined
  preview: any;
}

export enum SagaActionTypes {
  Fetch = 'messages/saga/fetch',
}

const fetch = createAction<Payload>(SagaActionTypes.Fetch);
const slice = createNormalizedSlice({
  name: 'messages',
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { fetch };
