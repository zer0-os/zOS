import moment from 'moment/moment';
import { AdminMessageType, Message as MessageModel } from '../../store/messages';
import { User as CurrentUser } from '../../store/authentication/types';
import { ConversationStatus, NormalizedChannel, User } from '../../store/channels';
import { isOneOnOne } from '../../store/channels-list/utils';

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

  // Separate media messages into their own map
  const mediaMessages = new Map();
  messages.forEach((message) => {
    if (message.rootMessageId) {
      mediaMessages.set(message.rootMessageId, message);
    }
  });

  // Process regular messages
  const processedMessages = messages.map((message) => {
    // Handle hidden messages
    if (message.isHidden) {
      message = {
        ...message,
        message: 'Message hidden',
      };
    }

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
    return message;
  });

  return {
    messages: processedMessages,
    mediaMessages,
  };
}

export const formatDayHeader = (dateString: string): string => {
  const date = moment(dateString);
  const today = moment().startOf('day');
  const yesterday = moment().subtract(1, 'day').startOf('day');

  if (date.isSame(today, 'day')) {
    return 'Today';
  } else if (date.isSame(yesterday, 'day')) {
    return 'Yesterday';
  } else if (date.year() === today.year()) {
    return date.format('ddd, MMM D');
  } else {
    return date.format('MMM D, YYYY');
  }
};

export const isUserOwnerOfMessage = (message: { sender: { userId: string } } | undefined, user: CurrentUser) => {
  return !!(user && message?.sender && user.id === message.sender.userId);
};

export const getConversationErrorMessage = (channel: NormalizedChannel, channelOtherMembers: User[]) => {
  if (channel?.conversationStatus !== ConversationStatus.ERROR) {
    return '';
  }

  let reference = 'the group';
  if (channel?.name) {
    reference = `${channel.name}`;
  } else if (isOneOnOne(channel)) {
    const otherMember = channelOtherMembers?.[0];
    if (otherMember) {
      reference = `${otherMember.firstName} ${otherMember.lastName}`;
    }
  }
  return `Sorry! We couldn't connect you with ${reference}. Please refresh and try again.`;
};

export const getFailureErrorMessage = (
  hasLoadedMessages: boolean,
  channelName: string | undefined,
  otherMemberFirstName: string | undefined
) => {
  if (hasLoadedMessages) {
    return 'Failed to load new messages.';
  }

  if (channelName) {
    return `Failed to load conversation with ${channelName}.`;
  } else {
    return `Failed to load your conversation with ${otherMemberFirstName || 'the other participant'}.`;
  }
};
