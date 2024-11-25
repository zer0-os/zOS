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
    case 'reaction':
      return `${senderName} reacted to your message with ${notification?.content?.reactionKey}`;
    default:
      return `${senderName} interacted with you`;
  }
}
