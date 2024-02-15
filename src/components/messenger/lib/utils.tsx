import { Item, Option } from './types';
import { Channel, User } from '../../../store/channels';

export const itemToOption = (item: Item): Option => {
  return {
    value: item.id,
    label: item.name,
    image: item.image,
    subLabel: getUserSubHandle(item.primaryZID, item.primaryWalletAddress),
  };
};

export const conversationToOption = (conversation: Channel): Option[] => {
  return conversation.otherMembers.map((member: User) => ({
    value: member.userId,
    label: member.firstName,
    image: member.profileImage,
  }));
};

export const highlightFilter = (text, filter) => {
  const regex = new RegExp(`(${filter})`, 'i');

  if (filter !== '' && text) {
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === filter.toLowerCase() ? (
        <span key={index} className='highlighted-text'>
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  return text;
};

export function getUserSubHandle(primaryZID: string, primaryWalletAddress: string) {
  if (primaryZID) {
    return primaryZID;
  }

  if (primaryWalletAddress) {
    return `${primaryWalletAddress.substring(0, 6)}...${primaryWalletAddress.substring(
      primaryWalletAddress.length - 4
    )}`;
  }

  return '';
}
