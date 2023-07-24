import moment from 'moment/moment';
import { Message as MessageModel } from '../../store/messages';

export function createMessageGroups(messages: MessageModel[]) {
  if (!messages.length) {
    return [];
  }

  const messageGroups = [];
  let groupIndex = 0;
  messageGroups[0] = [messages[0]];

  for (let i = 1; i < messages.length; ++i) {
    if (isRelated(messages[i - 1], messages[i])) {
      messageGroups[groupIndex].push(messages[i]);
    } else {
      messageGroups[++groupIndex] = [messages[i]];
    }
  }

  return messageGroups;
}

function isRelated(message1, message2) {
  return (
    message1 &&
    message2 &&
    !message1.isAdmin &&
    !message2.isAdmin &&
    message1.sender.userId === message2.sender.userId &&
    Math.abs(moment(message1.createdAt).diff(moment(message2.createdAt), 'minutes')) < 5
  );
}

export function getMessageRenderProps(index: number, groupLength: number, isOneOnOne: boolean) {
  const lastIndex = groupLength - 1;

  return {
    showAuthorName: index === 0 && !isOneOnOne,
    showTimestamp: index === lastIndex,
  };
}
