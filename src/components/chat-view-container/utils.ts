import moment from 'moment/moment';
import { MessageGroupPosition, Message as MessageModel } from '../../store/messages';

/**
 * Group messages by sender and time
 * @param messages
 */
export function groupMessages(messages: MessageModel[]): MessageModel[] {
  const groupedMessages = [];
  for (let i = 0; i < messages.length; ++i) {
    // first And last message will be either top or bottom respectively
    if (i === 0 && isRelated(messages[i], messages[i + 1])) {
      messages[i].positionInGroup = MessageGroupPosition.Top;
    } else if (i === messages.length - 1 && isRelated(messages[i], messages[i - 1])) {
      messages[i].positionInGroup = MessageGroupPosition.Bottom;
    }

    // for the middle messages, check if they are related to the previous and/or next message
    // and set the position accordingly
    const previousMessage = messages[i - 1];
    const nextMessage = messages[i + 1];
    if (!isRelated(previousMessage, messages[i]) && isRelated(messages[i], nextMessage)) {
      messages[i].positionInGroup = MessageGroupPosition.Top;
    }
    if (isRelated(previousMessage, messages[i]) && isRelated(messages[i], nextMessage)) {
      messages[i].positionInGroup = MessageGroupPosition.Middle;
    }
    if (isRelated(previousMessage, messages[i]) && !isRelated(messages[i], nextMessage)) {
      messages[i].positionInGroup = MessageGroupPosition.Bottom;
    }

    groupedMessages.push(messages[i]);
  }

  return groupedMessages;
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
