import { Channel, User } from '../channels';
import { AsyncListStatus } from '../normalized';

export interface DirectMessage extends Channel {
  otherMembers: User[];
}

export interface DirectMessagesState {
  list: DirectMessage[];
  activeDirectMessageId: string;
  syncStatus: AsyncListStatus;
}
export interface PayloadCreateDirectMessages {
  userIds: string[];
}
