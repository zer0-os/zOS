import { Payload } from './saga';
import { createAction } from '@reduxjs/toolkit';

import { createNormalizedSlice } from '../normalized';

import { LinkPreview } from '../../lib/link-preview';

interface Sender {
  userId: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  profileId: string;
}

export enum MediaType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  File = 'file',
}

export interface Media {
  height: number;
  name: string;
  type: MediaType;
  url: string;
  width: number;
}

export interface MessagesResponse {
  hasMore: boolean;
  messages: Message[];
}

export interface Message {
  id: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
  sender: Sender;
  // TODO: type to be defined
  mentionedUsers: any;
  hidePreview: boolean;
  preview: LinkPreview;
  media?: Media;
}

export enum SagaActionTypes {
  Fetch = 'messages/saga/fetch',
  startMessageSync = 'messages/saga/startMessageSync',
  SyncStart = 'CHAT_CHANNEL_SYNC_START',
}

export function syncStart() {
  return { type: SagaActionTypes.SyncStart };
}

const fetch = createAction<Payload>(SagaActionTypes.Fetch);
const startMessageSync = createAction<Payload>(SagaActionTypes.startMessageSync);
const slice = createNormalizedSlice({
  name: 'messages',
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { fetch, startMessageSync };
