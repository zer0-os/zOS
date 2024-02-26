import { Channel, User } from '../channels';

export interface DirectMessage extends Channel {
  otherMembers: User[];
}

export interface CreateMessengerConversation {
  name?: string;
  userIds: string[];
  image?: File;
}
