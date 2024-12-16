import { AdminMessageType, MediaType, Message, MessageSendStatus } from '../../store/messages';
import { RootState } from '../../store/reducer';
import { denormalize as denormalizeUser } from '../../store/users';
import { currentUserSelector } from '../../store/authentication/saga';
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

export function getMessagePreview(message: Message, state: RootState, isOneOnOne: boolean = false) {
  if (!message) {
    return 'Admin: System update or change occurred';
  }

  if (message.sendStatus === MessageSendStatus.FAILED) {
    return isOneOnOne ? 'Failed to send' : 'You: Failed to send';
  }

  if (message.isAdmin) {
    return adminMessageText(message, state);
  }

  if (message.isPost) {
    let prefix = previewPrefix(message.sender, state, isOneOnOne);
    return prefix ? `${prefix}: shared a new post` : 'shared a new post';
  }

  let prefix = previewPrefix(message.sender, state, isOneOnOne);
  return prefix
    ? `${prefix}: ${message.message || getMediaPreview(message)}`
    : `${message.message || getMediaPreview(message)}`;
}

function previewPrefix(sender: Message['sender'], state: RootState, isOneOnOne: boolean) {
  if (isOneOnOne) {
    return '';
  }

  const user = currentUserSelector()(state);
  return sender.userId === user.id ? 'You' : sender.firstName;
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

export function adminMessageText(message: Message, state: RootState) {
  const user = currentUserSelector()(state);

  let text = message.message;
  if (!message.admin) {
    return text;
  }

  switch (message.admin.type) {
    case AdminMessageType.JOINED_ZERO:
      return translateJoinedZero(message.admin, user, state) ?? text;
    case AdminMessageType.CONVERSATION_STARTED:
      return translateConversationStarted(message.admin, user, state) ?? text;
    case AdminMessageType.MEMBER_LEFT_CONVERSATION:
      return translateMemberLeftGroup(message.admin, state) ?? text;
    case AdminMessageType.MEMBER_ADDED_TO_CONVERSATION:
      return translateMemberAddedToGroup(message.admin, state) ?? text;
    case AdminMessageType.MEMBER_SET_AS_MODERATOR:
      return translateMemberSetAsModerator(message.admin, state) ?? text;
    case AdminMessageType.MEMBER_REMOVED_AS_MODERATOR:
      return translateMemberRemovedAsModerator(message.admin, state) ?? text;
    case AdminMessageType.REACTION:
      return translateReaction(message.admin, user, state) ?? text;
    case AdminMessageType.MEMBER_AVATAR_CHANGED:
      return translateMemberAvatarChanged(message.admin, user, state) ?? text;

    default:
      return text;
  }
}

function translateReaction(admin: { userId?: string; amount?: string }, currentUser, state: RootState) {
  const user = denormalizeUser(admin.userId, state);

  if (!admin.amount && admin.userId === currentUser.id) {
    return 'You sent a reaction';
  }

  if (!admin.amount && user?.firstName) {
    return `${user.firstName} sent a reaction`;
  }

  if (admin.amount && admin.userId === currentUser.id) {
    return `You reacted with ${admin.amount} MEOW`;
  }

  return admin.amount && user?.firstName ? `${user.firstName} reacted with ${admin.amount} MEOW` : null;
}

function translateJoinedZero(admin: { inviteeId?: string; inviterId?: string }, currentUser, state: RootState) {
  const isCurrentUserInvitee = admin.inviteeId === currentUser.id;
  if (isCurrentUserInvitee) {
    const inviter = denormalizeUser(admin.inviterId, state);
    return inviter?.firstName ? `You joined ${inviter.firstName} on ZERO` : null;
  }

  const invitee = denormalizeUser(admin.inviteeId, state);
  return invitee?.firstName ? `${invitee.firstName} joined you on ZERO` : null;
}

function translateConversationStarted(admin: { userId?: string }, currentUser, state: RootState) {
  if (admin.userId === currentUser.id) {
    return 'You started the conversation';
  }

  const user = denormalizeUser(admin.userId, state);
  return user?.firstName ? `${user.firstName} started the conversation` : null;
}

function translateMemberLeftGroup(admin: { userId?: string }, state: RootState) {
  const user = denormalizeUser(admin.userId, state);
  return user?.firstName ? `${user.firstName} left the conversation` : null;
}

function translateMemberAddedToGroup(admin: { userId?: string }, state: RootState) {
  const user = denormalizeUser(admin.userId, state);
  return user?.firstName ? `${user.firstName} was added to the conversation` : null;
}

function translateMemberSetAsModerator(admin: { userId?: string }, state: RootState) {
  const user = denormalizeUser(admin.userId, state);
  return user?.firstName ? `${user.firstName} was set as moderator by admin` : null;
}

function translateMemberRemovedAsModerator(admin: { userId?: string }, state: RootState) {
  const user = denormalizeUser(admin.userId, state);
  return user?.firstName ? `${user.firstName} was removed as moderator by admin` : null;
}

function translateMemberAvatarChanged(admin: { userId?: string }, currentUser, state: RootState) {
  if (admin.userId === currentUser.id) {
    return 'Admin: You changed your avatar';
  }

  const user = denormalizeUser(admin.userId, state);
  return user?.firstName ? `Admin: ${user.firstName} changed their avatar` : null;
}
