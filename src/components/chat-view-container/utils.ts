import moment from 'moment/moment';
import { AdminMessageType, Message as MessageModel } from '../../store/messages';

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

export function mapMessagesById(channelMessages) {
  const messagesById = {};
  channelMessages.forEach((m) => {
    messagesById[m.id.toString()] = m;
    if (m.id.toString() !== m.optimisticId) {
      messagesById[m.optimisticId] = m;
    }
  });
  return messagesById;
}

export function mapMessagesByRootId(channelMessages) {
  const messagesByRootId = {};
  channelMessages.forEach((m) => {
    if (m.rootMessageId) {
      messagesByRootId[m.rootMessageId] = m;
    }
  });
  return messagesByRootId;
}

export function linkMessages(channelMessages, messagesById, messagesByRootId) {
  const messages = [];
  const mediaMessages = [];

  channelMessages.forEach((m) => {
    if (m.parentMessageId) {
      linkParentMessage(m, messagesById, messagesByRootId);
      messages.push(m);
    } else if (m.rootMessageId) {
      linkMediaMessage(m, messagesById, mediaMessages, messages);
    } else {
      messages.push(m);
    }
  });

  return messages;
}

export function linkParentMessage(message, messagesById, messagesByRootId) {
  const parentMessage = messagesById[message.parentMessageId];

  if (parentMessage) {
    message.parentMessage = parentMessage;
    message.parentMessageText = parentMessage.isHidden ? 'Message hidden' : parentMessage.message;
    message.parentMessageMedia = parentMessage.media;

    const rootMessage = messagesByRootId[parentMessage.id];
    if (rootMessage) {
      message.parentMessageMedia = rootMessage.media || message.parentMessageMedia;
    }
  }
}

export function linkMediaMessage(message, messagesById, mediaMessages, messages) {
  const rootMessage = messagesById[message.rootMessageId];
  if (rootMessage) {
    rootMessage.media = { id: message.id, ...message.media };
    mediaMessages.push(message);
  } else {
    messages.push(message);
  }
}
