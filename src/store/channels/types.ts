export interface Payload {
  channelId: string;
}

export interface MarkAsReadPayload {
  channelId: string;
  userId: string;
}

export interface UnreadCountUpdatedPayload {
  channelId: string;
  unreadCount: number;
}
