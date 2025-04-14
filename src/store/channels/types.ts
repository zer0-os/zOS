export interface UnreadCountUpdatedPayload {
  channelId: string;
  unreadCount: { total: number; highlight: number };
}

export interface CreateMessengerConversation {
  userIds: string[];
  name?: string;
  image?: File;
  groupType?: 'encrypted' | 'unencrypted';
}
