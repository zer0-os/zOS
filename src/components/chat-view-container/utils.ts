import moment from 'moment/moment';
import { ChatMessage } from '../../lib/chat/types';
import { MessageGroupPosition } from './chat-view';

/**
 * Group messages by sender and time
 * @param messages
 */
export function groupMessages(messages: ChatMessage[]): ChatMessage[] {
  const groups = [...messages];

  groups.forEach((message, i) => {
    const previousMessage = messages[i - 1];
    const nextMessage = messages[i + 1];

    if (
      !previousMessage ||
      previousMessage.groupPosition === MessageGroupPosition.End ||
      !isRelated(previousMessage, message)
    ) {
      if (!isRelated(nextMessage, message)) {
        message.groupPosition = MessageGroupPosition.Single;
      } else {
        message.groupPosition = MessageGroupPosition.Start;
      }
    } else if (isRelated(nextMessage, message)) {
      message.groupPosition = MessageGroupPosition.Middle;
    } else {
      message.groupPosition = MessageGroupPosition.End;
    }
  });

  return groups;
}

function isRelated(message1, message2) {
  return (
    message1 &&
    message2 &&
    message1.sender.userId === message2.sender.userId &&
    Math.abs(moment(message1.createdAt).diff(moment(message2.createdAt), 'minutes')) < 5
  );
}
