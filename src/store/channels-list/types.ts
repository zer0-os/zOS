import { Channel, User } from '../channels';

export enum ChannelType {
  Channel,
  DirectMessage,
}

export interface DirectMessage extends Channel {
  otherMembers: User[];
}

export interface CreateMessengerConversation {
  name?: string;
  userIds: string[];
  image?: File;
}
