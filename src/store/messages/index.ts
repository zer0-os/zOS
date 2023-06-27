import { Payload, SendPayload, QueryUploadPayload, MediaPayload, EditPayload } from './saga';
import { createAction } from '@reduxjs/toolkit';

import { createNormalizedSlice, removeAll } from '../normalized';

import { LinkPreview } from '../../lib/link-preview';

export interface AttachmentUploadResult {
  name: string;
  key: string;
  url: string;
  type: 'file';
}

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
export interface InfoUploadResponse {
  apiUrl: string;
  query: QueryUploadPayload;
}

export enum AdminMessageType {
  JOINED_ZERO = 'JOINED_ZERO',
}

export interface Message {
  id: number;
  message?: string;
  parentMessageText?: string;
  isAdmin: boolean;
  createdAt: number;
  updatedAt: number;
  sender: Sender;
  // TODO: type to be defined
  mentionedUserIds: any;
  hidePreview: boolean;
  preview: LinkPreview;
  media?: Media;
  admin?: {
    type: AdminMessageType;
    inviterId?: string;
    inviteeId?: string;
  };
}

export interface EditMessageOptions {
  hidePreview: Boolean;
  mentionedUsers: string[];
}

export enum SagaActionTypes {
  Fetch = 'messages/saga/fetch',
  Send = 'messages/saga/send',
  DeleteMessage = 'messages/saga/deleteMessage',
  EditMessage = 'messages/saga/editMessage',
  startMessageSync = 'messages/saga/startMessageSync',
  stopSyncChannels = 'messages/saga/stopSyncChannels',
  uploadFileMessage = 'messages/saga/uploadFileMessage',
}

const fetch = createAction<Payload>(SagaActionTypes.Fetch);
const send = createAction<SendPayload>(SagaActionTypes.Send);
const deleteMessage = createAction<Payload>(SagaActionTypes.DeleteMessage);
const editMessage = createAction<EditPayload>(SagaActionTypes.EditMessage);
const startMessageSync = createAction<Payload>(SagaActionTypes.startMessageSync);
const stopSyncChannels = createAction<Payload>(SagaActionTypes.stopSyncChannels);
const uploadFileMessage = createAction<MediaPayload>(SagaActionTypes.uploadFileMessage);

const slice = createNormalizedSlice({
  name: 'messages',
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { fetch, send, startMessageSync, stopSyncChannels, deleteMessage, editMessage, uploadFileMessage, removeAll };
