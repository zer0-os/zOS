import { Channel, User } from '../channels';

export interface DirectMessage extends Channel {
  otherMembers: User[];
}

interface CreateMessengerConversationBase {
  name?: string;
  image?: File;
  groupType?: string;
}

export type CreateMessengerConversation = CreateMessengerConversationBase &
  (
    | {
        matrixIds?: string[];
        userIds?: string[];
      }
    | {
        matrixIds: string[];
      }
    | {
        userIds: string[];
      }
  );
