import { Payload, SendPayload, QueryUploadPayload, EditPayload } from './saga';
import { createAction } from '@reduxjs/toolkit';

import { createNormalizedSlice, removeAll } from '../normalized';

import { LinkPreview } from '../../lib/link-preview';
import { ParentMessage } from '../../lib/chat/types';

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
  primaryZID: string;
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
  MEMBER_LEFT_CONVERSATION = 'MEMBER_LEFT_CONVERSATION',
  MEMBER_ADDED_TO_CONVERSATION = 'MEMBER_ADDED_TO_CONVERSATION',
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
  parentMessage?: ParentMessage;
  isAdmin: boolean;
  createdAt: number;
  updatedAt: number;
  sender: Sender;
  mentionedUsers: { id: string }[];
  hidePreview: boolean;
  preview: LinkPreview;
  media?: Media;
  admin?: {
    type: AdminMessageType;
    inviterId?: string;
    inviteeId?: string;
    userId?: string;
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
