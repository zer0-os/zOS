import { Item, Option } from './types';
import { Channel, User } from '../../../store/channels';
import { getUserSubHandle } from '../../../lib/user';

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

export const getOtherMembersTypingDisplayJSX = (otherMembersTypingInRoom: string[]) => {
  let text = <></>;

  if (!otherMembersTypingInRoom) {
    return;
  }

  switch (otherMembersTypingInRoom.length) {
    case 0:
      break;
    case 1:
      text = (
        <>
          <b>{otherMembersTypingInRoom[0]}</b> is typing...
        </>
      );
      break;
    case 2:
      text = (
        <>
          <b>{otherMembersTypingInRoom[0]}</b> and <b>{otherMembersTypingInRoom[1]}</b> are typing...
        </>
      );
      break;
    default:
      text = (
        <>
          <b>{otherMembersTypingInRoom[0]}</b> and <b>{otherMembersTypingInRoom.length - 1}</b> others are typing...
        </>
      );
  }

  return text;
};

export const getOtherMembersTypingDisplayText = (otherMembersTypingInRoom: string[]) => {
  let text = null;

  switch (otherMembersTypingInRoom.length) {
    case 0:
      break;
    case 1:
      text = `${otherMembersTypingInRoom[0]} is typing...`;
      break;
    case 2:
      text = `${otherMembersTypingInRoom[0]} and ${otherMembersTypingInRoom[1]} are typing...`;
      break;
    default:
      text = `${otherMembersTypingInRoom[0]} and ${otherMembersTypingInRoom.length - 1} others are typing...`;
  }

  return text;
};
