import { User } from '../../store/channels';
import { AdminMessageType, MediaType, Message, MessageSendStatus } from '../../store/messages';
import moment from 'moment';

export function previewDisplayDate(timestamp: number, currentDate = moment()) {
  if (!timestamp) {
    return '';
  }

  const messageDate = moment(timestamp);

  if (messageDate.isSame(currentDate, 'day')) {
    return messageDate.format('h:mm A');
  } else if (messageDate.isAfter(currentDate.clone().subtract(7, 'days'), 'day')) {
    return messageDate.format('ddd');
  } else if (messageDate.year() === currentDate.year()) {
    return messageDate.format('MMM D');
  }

  return messageDate.format('MMM D, YYYY');
}

export function getMessagePreview(
  message: Message,
  currentUserId: string,
  getUser: (id: string) => User | undefined,
  isOneOnOne: boolean = false
) {
  if (!message) {
    return '';
  }

  if (message.sendStatus === MessageSendStatus.FAILED) {
    return isOneOnOne ? 'Failed to send' : 'You: Failed to send';
  }

  if (message.isAdmin) {
    return adminMessageText(message, currentUserId, getUser);
  }

  if (message.isPost) {
    let prefix = previewPrefix(message.sender, currentUserId, isOneOnOne);
    return prefix ? `${prefix}: shared a new post` : 'shared a new post';
  }

  let prefix = previewPrefix(message.sender, currentUserId, isOneOnOne);
  return prefix
    ? `${prefix}: ${message.message || getMediaPreview(message)}`
    : `${message.message || getMediaPreview(message)}`;
}

function previewPrefix(sender: Message['sender'], currentUserId: string, isOneOnOne: boolean) {
  if (isOneOnOne) {
    return '';
  }

  return sender.userId === currentUserId ? 'You' : sender.firstName;
}

function getMediaPreview(message: Message) {
  switch (message?.media?.type) {
    case MediaType.Image:
      return 'sent an image';
    case MediaType.Video:
      return 'sent a video';
    case MediaType.File:
      return 'sent a file';
    case MediaType.Audio:
      return 'sent an audio message';
    default:
      return '';
  }
}

export function adminMessageText(message: Message, currentUserId: string, getUser: (id: string) => User | undefined) {
  let text = message.message;
  if (!message.admin) {
    return text;
  }

  switch (message.admin.type) {
    case AdminMessageType.JOINED_ZERO:
      return translateJoinedZero(message.admin, currentUserId, getUser) ?? text;
    case AdminMessageType.CONVERSATION_STARTED:
      return translateConversationStarted(message.admin, currentUserId, getUser) ?? text;
    case AdminMessageType.MEMBER_LEFT_CONVERSATION:
      return translateMemberLeftGroup(message.admin, getUser) ?? text;
    case AdminMessageType.MEMBER_ADDED_TO_CONVERSATION:
      return translateMemberAddedToGroup(message.admin, getUser) ?? text;
    case AdminMessageType.MEMBER_SET_AS_MODERATOR:
      return translateMemberSetAsModerator(message.admin, getUser) ?? text;
    case AdminMessageType.MEMBER_REMOVED_AS_MODERATOR:
      return translateMemberRemovedAsModerator(message.admin, getUser) ?? text;
    case AdminMessageType.REACTION:
      return translateReaction(message.admin, currentUserId, getUser) ?? text;
    case AdminMessageType.MEMBER_AVATAR_CHANGED:
      return translateMemberAvatarChanged(message.admin, currentUserId, getUser) ?? text;

    default:
      return text;
  }
}

function translateReaction(
  admin: { userId?: string; amount?: string },
  currentUserId: string,
  getUser: (id: string) => User | undefined
) {
  const user = getUser(admin.userId);

  if (!admin.amount && admin.userId === currentUserId) {
    return 'You sent a reaction';
  }

  if (!admin.amount && user?.firstName) {
    return `${user.firstName} sent a reaction`;
  }

  if (admin.amount && admin.userId === currentUserId) {
    return `You reacted with ${admin.amount} MEOW`;
  }

  return admin.amount && user?.firstName ? `${user.firstName} reacted with ${admin.amount} MEOW` : null;
}

function translateJoinedZero(
  admin: { inviteeId?: string; inviterId?: string },
  currentUserId: string,
  getUser: (id: string) => User | undefined
) {
  const isCurrentUserInvitee = admin.inviteeId === currentUserId;
  if (isCurrentUserInvitee) {
    const inviter = getUser(admin.inviterId);
    return inviter?.firstName ? `You joined ${inviter.firstName} on ZERO` : null;
  }

  const invitee = getUser(admin.inviteeId);
  return invitee?.firstName ? `${invitee.firstName} joined you on ZERO` : null;
}

function translateConversationStarted(
  admin: { userId?: string },
  currentUserId: string,
  getUser: (id: string) => User | undefined
) {
  if (admin.userId === currentUserId) {
    return 'You started the conversation';
  }

  const user = getUser(admin.userId);
  return user?.firstName ? `${user.firstName} started the conversation` : null;
}

function translateMemberLeftGroup(admin: { userId?: string }, getUser: (id: string) => User | undefined) {
  const user = getUser(admin.userId);
  return user?.firstName ? `${user.firstName} left the conversation` : null;
}

function translateMemberAddedToGroup(admin: { userId?: string }, getUser: (id: string) => User | undefined) {
  const user = getUser(admin.userId);
  return user?.firstName ? `${user.firstName} was added to the conversation` : null;
}

function translateMemberSetAsModerator(admin: { userId?: string }, getUser: (id: string) => User | undefined) {
  const user = getUser(admin.userId);
  return user?.firstName ? `${user.firstName} was set as moderator by admin` : null;
}

function translateMemberRemovedAsModerator(admin: { userId?: string }, getUser: (id: string) => User | undefined) {
  const user = getUser(admin.userId);
  return user?.firstName ? `${user.firstName} was removed as moderator by admin` : null;
}

function translateMemberAvatarChanged(
  admin: { userId?: string },
  currentUserId: string,
  getUser: (id: string) => User | undefined
) {
  if (admin.userId === currentUserId) {
    return 'Admin: You changed your avatar';
  }

  const user = getUser(admin.userId);
  return user?.firstName ? `Admin: ${user.firstName} changed their avatar` : null;
}
