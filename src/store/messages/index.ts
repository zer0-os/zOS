import { Payload, SendPayload, DeleteMessageActionParameter } from './saga';
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
  id: number;
  message?: string;
  createdAt: number;
  updatedAt: number;
  sender: Sender;
  // TODO: type to be defined
  mentionedUserIds: any;
  hidePreview: boolean;
  preview: LinkPreview;
  media?: Media;
}

export enum SagaActionTypes {
  Fetch = 'messages/saga/fetch',
  Send = 'messages/saga/send',
  DeleteMessage = 'messages/saga/deleteMessage',
  startMessageSync = 'messages/saga/startMessageSync',
  stopSyncChannels = 'messages/saga/stopSyncChannels',
  receiveNewMessage = 'messages/saga/receiveNewMessage',
  receiveDeleteMessage = 'messages/saga/receiveDeleteMessage',
}

const fetch = createAction<Payload>(SagaActionTypes.Fetch);
const send = createAction<SendPayload>(SagaActionTypes.Send);
const deleteMessage = createAction<Payload>(SagaActionTypes.DeleteMessage);
const startMessageSync = createAction<Payload>(SagaActionTypes.startMessageSync);
const stopSyncChannels = createAction<Payload>(SagaActionTypes.stopSyncChannels);
const receiveNewMessage = createAction<SendPayload>(SagaActionTypes.receiveNewMessage);
const receiveDeleteMessage = createAction<DeleteMessageActionParameter>(SagaActionTypes.receiveDeleteMessage);

const slice = createNormalizedSlice({
  name: 'messages',
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { fetch, send, startMessageSync, stopSyncChannels, receiveNewMessage, deleteMessage, receiveDeleteMessage };
