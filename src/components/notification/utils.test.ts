import { mapNotification } from './utils';

describe('mapNotification', () => {
  const subject = (notification = {}, channelTextFor?: string) => {
    return mapNotification(notification, channelTextFor);
  };

  describe('unknown type', () => {
    it('maps body with a known channel', () => {
      const mappedNotification = subject({ notificationType: 'unknown_type' }, {});

      expect(mappedNotification).toBeNull();
    });
  });

  describe('chat_channel_mention', () => {
    it('maps body with a known channel', () => {
      const mappedNotification = subject(
        {
          notificationType: 'chat_channel_mention',
          data: { chatId: 'chat-id' },
          originUser: {
            profileSummary: {
              firstName: 'Johnny',
              lastName: 'Chatter',
              profileImage: 'image-url',
            },
          },
        },
        'TestingChannel'
      );

      expect(mappedNotification.body).toEqual('Johnny Chatter mentioned you in #TestingChannel');
    });

    it('maps body with unknown info', () => {
      const mappedNotification = subject({
        notificationType: 'chat_channel_mention',
        data: { chatId: 'chat-id' },
      });

      expect(mappedNotification.body).toEqual('Someone mentioned you in a channel');
    });

    it('maps default properties', () => {
      const mappedNotification = subject({
        id: 'notification-id',
        notificationType: 'chat_channel_mention',
        data: { chatId: 'chat-id' },
        createdAt: '2023-01-20T22:33:34.945Z',
      });

      expect(mappedNotification.id).toEqual('notification-id');
      expect(mappedNotification.createdAt).toEqual('2023-01-20T22:33:34.945Z');
    });

    it('maps sender', () => {
      const mappedNotification = subject({
        notificationType: 'chat_channel_mention',
        data: {},
        originUser: {
          profileSummary: {
            firstName: 'first',
            lastName: 'Last',
            profileImage: 'image-url',
          },
        },
      });

      expect(mappedNotification.originatingName).toEqual('first Last');
      expect(mappedNotification.originatingImageUrl).toEqual('image-url');
    });
  });

  describe('chat_channel_message_replied', () => {
    it('maps default properties', () => {
      const mappedNotification = subject({
        id: 'notification-id',
        notificationType: 'chat_channel_message_replied',
        data: { chatId: 'chat-id' },
        createdAt: '2023-01-20T22:33:34.945Z',
        isUnread: true,
      });

      expect(mappedNotification.id).toEqual('notification-id');
      expect(mappedNotification.createdAt).toEqual('2023-01-20T22:33:34.945Z');
      expect(mappedNotification.isUnread).toBeTrue();
    });

    it('maps body with unknown info', () => {
      const mappedNotification = subject({
        notificationType: 'chat_channel_message_replied',
        data: { chatId: 'chat-id' },
      });

      expect(mappedNotification.body).toEqual('Someone replied to you in a channel');
    });

    it('maps body with a known channel and sender', () => {
      const mappedNotification = subject(
        {
          notificationType: 'chat_channel_message_replied',
          data: { chatId: 'chat-id' },
          originUser: {
            profileSummary: {
              firstName: 'Johnny',
              lastName: 'Chatter',
              profileImage: 'image-url',
            },
          },
        },
        'TestingChannel'
      );

      expect(mappedNotification.body).toEqual('Johnny Chatter replied to you in #TestingChannel');
    });

    it('maps sender', () => {
      const mappedNotification = subject({
        notificationType: 'chat_channel_message_replied',
        data: {},
        originUser: {
          profileSummary: {
            firstName: 'first',
            lastName: 'Last',
            profileImage: 'image-url',
          },
        },
      });

      expect(mappedNotification.originatingName).toEqual('first Last');
      expect(mappedNotification.originatingImageUrl).toEqual('image-url');
    });
  });

  describe('chat_dm_mention', () => {
    function conversationMention(attrs) {
      return {
        id: 'notification-id',
        notificationType: 'chat_dm_mention',
        data: {},
        ...attrs,
      };
    }
    it('maps default properties', () => {
      const mappedNotification = subject(
        conversationMention({
          id: 'notification-id',
          createdAt: '2023-01-20T22:33:34.945Z',
          isUnread: true,
        })
      );

      expect(mappedNotification.id).toEqual('notification-id');
      expect(mappedNotification.createdAt).toEqual('2023-01-20T22:33:34.945Z');
      expect(mappedNotification.isUnread).toBeTrue();
    });

    it('maps body', () => {
      const mappedNotification = subject(
        conversationMention({
          originUser: {
            profileSummary: {
              firstName: 'Johnny',
              lastName: 'Chatter',
              profileImage: 'image-url',
            },
          },
        })
      );

      expect(mappedNotification.body).toEqual('Johnny Chatter mentioned you in a conversation');
    });

    it('maps sender', () => {
      const mappedNotification = subject(
        conversationMention({
          originUser: {
            profileSummary: {
              firstName: 'first',
              lastName: 'Last',
              profileImage: 'image-url',
            },
          },
        })
      );

      expect(mappedNotification.originatingName).toEqual('first Last');
      expect(mappedNotification.originatingImageUrl).toEqual('image-url');
    });
  });
});
