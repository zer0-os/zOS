import { Notification } from '../../../store/notifications';

export function getNotificationContent(notification: Notification): string {
  const senderName = notification.sender?.firstName || 'Someone';

  switch (notification.type) {
    case 'reply':
      return `${senderName} replied to your message`;
    case 'direct_message':
      return `${senderName} sent you a direct message`;
    case 'mention':
      return `${senderName} mentioned you in conversation`;
    case 'reaction': {
      const isMeowReaction = notification?.content?.reactionKey?.startsWith('MEOW_');
      if (isMeowReaction) {
        return `${senderName} reacted to your post with ${notification.content?.amount} MEOW`;
      }
      return `${senderName} reacted to your message with ${notification?.content?.reactionKey}`;
    }
    default:
      return `${senderName} interacted with you`;
  }
}
