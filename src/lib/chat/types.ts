export interface ChatMessage {
  [key: string]: any;
}

export interface ChatMember {
  [key: string]: any;
}

export interface ParentMessage {
  messageId: number;
  message?: string;
  userId: string;
}
