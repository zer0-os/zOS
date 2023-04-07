import { Channel, User } from '../channels';

export interface Payload {
  channelId: string;
}

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

export interface ChannelsReceivedPayload {
  channels: Channel[];
}
