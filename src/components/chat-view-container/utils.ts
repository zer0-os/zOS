import moment from 'moment/moment';
import { AdminMessageType, Message as MessageModel } from '../../store/messages';

export function createMessageGroups(messages: MessageModel[]): MessageModel[][] {
  if (!messages.length) {
    return [];
  }

  const messageGroups: MessageModel[][] = [];
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

function isRelated(message1: MessageModel, message2: MessageModel) {
  return (
    message1 &&
    message2 &&
    !message1.isAdmin &&
    !message2.isAdmin &&
    message1.sender.userId === message2.sender.userId &&
    Math.abs(moment(message1.createdAt).diff(moment(message2.createdAt), 'minutes')) < 5
  );
}

export function getMessageRenderProps(index: number, groupLength: number, isOneOnOne: boolean, isOwner: boolean) {
  const lastIndex = groupLength - 1;
  let position = '';
  if (groupLength <= 1) {
    position = 'only';
  } else if (index === 0) {
    position = 'first';
  } else if (index === lastIndex) {
    position = 'last';
  }

  return {
    showAuthorName: index === 0 && !isOwner && !isOneOnOne,
    showTimestamp: index === lastIndex,
    position,
  };
}

export function filterAdminMessages(messagesByDay) {
  let hasJoinedZeroAdminMessage = false;

  for (const day in messagesByDay) {
    if (messagesByDay[day].some((message) => message.isAdmin && message.admin.type === AdminMessageType.JOINED_ZERO)) {
      hasJoinedZeroAdminMessage = true;
      break;
    }
  }

  const filteredMessagesByDay = {};
  Object.keys(messagesByDay).forEach((day) => {
    filteredMessagesByDay[day] = messagesByDay[day].filter((message) => {
      return !(
        hasJoinedZeroAdminMessage &&
        message.isAdmin &&
        message.admin.type === AdminMessageType.CONVERSATION_STARTED
      );
    });
  });

  return filteredMessagesByDay;
}

// It's important to retain references since these messages come from redux state
export function processMessages(messages: MessageModel[]) {
  const messagesById = new Map();
  const messagesByRootId = new Map();

  messages.forEach((message) => {
    messagesById.set(message.id, message);
    if (message.id !== message.optimisticId) {
      messagesById.set(message.optimisticId, message);
    }
    if (message.rootMessageId) {
      messagesByRootId.set(message.rootMessageId, message);
    }
  });

  return messages.map((message) => {
    // Handle parent messages
    if (message.parentMessageId) {
      const parentMessage = messagesById.get(message.parentMessageId);
      if (parentMessage) {
        return {
          ...message,
          parentMessage,
          parentMessageText: parentMessage.isHidden ? 'Message hidden' : parentMessage.message,
          parentMessageMedia: messagesByRootId.get(parentMessage.id)?.media || parentMessage.media,
        };
      }
    }
    // Handle media messages
    if (message.rootMessageId) {
      const rootMessage = messagesById.get(message.rootMessageId);
      if (rootMessage) {
        return {
          ...message,
          media: { id: message.id, ...message.media },
        };
      }
    }
    return message;
  });
}
