import { getNotificationContent } from './utils';

describe('Notification Feed Utils', () => {
  describe(getNotificationContent, () => {
    it('returns correct message for reply notification', () => {
      const notification = {
        type: 'reply',
        sender: { firstName: 'John' },
      } as any;

      expect(getNotificationContent(notification)).toBe('John replied to your message');
    });

    it('returns correct message for direct message notification', () => {
      const notification = {
        type: 'direct_message',
        sender: { firstName: 'Jane' },
      } as any;

      expect(getNotificationContent(notification)).toBe('Jane sent you a direct message');
    });

    it('returns correct message for mention notification', () => {
      const notification = {
        type: 'mention',
        sender: { firstName: 'Bob' },
      } as any;

      expect(getNotificationContent(notification)).toBe('Bob mentioned you in conversation');
    });

    it('returns correct message for reaction notification', () => {
      const notification = {
        type: 'reaction',
        sender: { firstName: 'Charlie' },
        content: {
          reactionKey: '👍',
        },
      } as any;

      expect(getNotificationContent(notification)).toBe('Charlie reacted to your message with 👍');
    });

    it('uses "Someone" when sender firstName is not available', () => {
      const notification = {
        type: 'direct_message',
        sender: {},
      } as any;

      expect(getNotificationContent(notification)).toBe('Someone sent you a direct message');
    });

    it('returns default message for unknown notification type', () => {
      const notification = {
        type: 'unknown_type',
        sender: { firstName: 'Dave' },
      } as any;

      expect(getNotificationContent(notification)).toBe('Dave interacted with you');
    });
  });
});
