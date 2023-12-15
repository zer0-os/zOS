export interface ChatMessage {
  [key: string]: any;
}

export interface ParentMessage {
  messageId: number;
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
}

export interface User {
  userId: string;
  matrixId: string;
}

export enum PowerLevels {
  Viewer = 0, // Default
  Editor = 50, // "Moderator" or ~PL50
  Owner = 100, // "Admin" or PL100
}
