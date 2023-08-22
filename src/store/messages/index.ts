import { Payload, SendPayload, QueryUploadPayload, EditPayload } from './saga';
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
  CONVERSATION_STARTED = 'CONVERSATION_STARTED',
}

export enum MessageSendStatus {
  SUCCESS,
  IN_PROGRESS,
  FAILED,
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
    creatorId?: string;
  };
  optimisticId?: string;
  rootMessageId?: string;
  sendStatus: MessageSendStatus;
}

export interface EditMessageOptions {
  hidePreview: Boolean;
}

export enum SagaActionTypes {
  Fetch = 'messages/saga/fetch',
  Send = 'messages/saga/send',
  DeleteMessage = 'messages/saga/deleteMessage',
  EditMessage = 'messages/saga/editMessage',
}

const fetch = createAction<Payload>(SagaActionTypes.Fetch);
const send = createAction<SendPayload>(SagaActionTypes.Send);
const deleteMessage = createAction<Payload>(SagaActionTypes.DeleteMessage);
const editMessage = createAction<EditPayload>(SagaActionTypes.EditMessage);

const slice = createNormalizedSlice({
  name: 'messages',
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { fetch, send, deleteMessage, editMessage, removeAll };
