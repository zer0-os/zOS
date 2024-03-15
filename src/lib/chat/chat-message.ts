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

export function getMessagePreview(message: Message, state: RootState) {
  if (!message) {
    return '';
  }

  if (message.sendStatus === MessageSendStatus.FAILED) {
    return 'You: Failed to send';
  }

  if (message.isAdmin) {
    return adminMessageText(message, state);
  }

  let prefix = previewPrefix(message.sender, state);
  return `${prefix}: ${message.message || getMediaPreview(message)}`;
}

function previewPrefix(sender: Message['sender'], state: RootState) {
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
    default:
      return text;
  }
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
