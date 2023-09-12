export interface ChatMessage {
  [key: string]: any;
}

export interface ChatMember {
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
