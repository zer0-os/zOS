import { Channel, User } from '../channels';

export interface DirectMessage extends Channel {
  otherMembers: User[];
}

export interface DirectMessagesState {
  list: DirectMessage[];
  activeDirectMessageId: string;
}
