import { Item, Option } from './types';
import { Channel, User } from '../../../store/channels';

export const itemToOption = (item: Item): Option => {
  return {
    value: item.id,
    label: item.name,
    image: item.image,
  };
};

export const conversationToOption = (conversation: Channel): Option[] => {
  return conversation.otherMembers.map((member: User) => ({
    value: member.userId,
    label: member.firstName,
    image: member.profileImage,
  }));
};
