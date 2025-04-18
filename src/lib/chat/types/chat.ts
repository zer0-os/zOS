import { Media } from '../../../store/messages';

export interface ChatMessage {
  [key: string]: any;
}

export interface MatrixProfileInfo {
  avatarUrl?: string;
  displayName?: string;
}

export interface ParentMessage {
  messageId: string;
  userId: string;

  message?: string;
  sender: {
    userId: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    profileId: string;
  };
  isAdmin: boolean;
  mentionedUsers: { id: string }[];
  hidePreview: boolean;
  admin?: any;
  optimisticId?: string;
  rootMessageId?: string;
  media?: Media;
}

export interface User {
  userId: string;
  matrixId: string;
}

export enum PowerLevels {
  Viewer = 0, // Default
  Moderator = 50, // "Moderator" or ~PL50
  Owner = 100, // "Admin" or PL100
}

export enum ChatMessageType {
  GROUP = 'group', // encrpyted/unencrypted group chats
  CHANNEL = 'channel', // token gated (social) chats
}

export type NotificationCount = {
  total: number;
  highlight: number;
};
