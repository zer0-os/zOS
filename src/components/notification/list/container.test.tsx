import React from 'react';
import { shallow } from 'enzyme';

import { RootState } from '../../../store/reducer';
import { AsyncListStatus } from '../../../store/normalized';

import { Container, Properties } from './container';

describe('NotificationsListContainer', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      notifications: [],
      userId: '',
      fetchNotifications: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes notifications to the NotificationList', () => {
    const notifications = [
      { a: 'notification' },
      { b: 'notification' },
    ];
    const wrapper = subject({ notifications });

    expect(wrapper.find('NotificationList').prop('list')).toEqual(notifications);
  });

  it('fetches the notifications when rendered', () => {
    const fetchNotifications = jest.fn();

    subject({ fetchNotifications });

    expect(fetchNotifications).toHaveBeenCalledOnce();
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) => {
      return Container.mapState({
        authentication: { user: { data: { id: 'user-id' } as any } },
        notificationsList: { value: [] },
        ...state,
      } as RootState);
    };

    test('notifications', () => {
      const state = subject({
        notificationsList: {
          status: AsyncListStatus.Idle,
          value: [
            'id-1',
            'id-2',
          ],
        },
        normalized: {
          notifications: {
            'id-1': { id: 'id-1', notificationType: 'chat_channel_mention' },
            'id-2': { id: 'id-2', notificationType: 'chat_channel_mention' },
          },
        },
      });

      expect(state.notifications).toIncludeAllPartialMembers([
        { id: 'id-1' },
        { id: 'id-2' },
      ]);
    });

    test('userId', () => {
      const state = subject({
        authentication: { user: { data: { id: 'user-id' } as any }, loading: false },
      });

      expect(state.userId).toEqual('user-id');
    });
  });

  describe('mapNotification', () => {
    const subject = (notification = {}, state: Partial<RootState> = {}) => {
      return Container.mapNotification(notification, state as RootState);
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
          {
            normalized: {
              channels: {
                'chat-id': { id: 'chat-id', name: 'TestingChannel' },
              },
            },
          }
        );

        expect(mappedNotification.body).toEqual('Johnny Chatter mentioned you in #TestingChannel');
      });

      it('maps body with unknown info', () => {
        const mappedNotification = subject(
          {
            notificationType: 'chat_channel_mention',
            data: { chatId: 'chat-id' },
          },
          {
            normalized: {
              channels: {},
            },
          }
        );

        expect(mappedNotification.body).toEqual('Someone mentioned you in a channel');
      });

      it('maps default properties', () => {
        const mappedNotification = subject(
          {
            id: 'notification-id',
            notificationType: 'chat_channel_mention',
            data: { chatId: 'chat-id' },
            createdAt: '2023-01-20T22:33:34.945Z',
          },
          {
            normalized: { channels: {} },
          }
        );

        expect(mappedNotification.id).toEqual('notification-id');
        expect(mappedNotification.createdAt).toEqual('2023-01-20T22:33:34.945Z');
      });

      it('maps sender', () => {
        const mappedNotification = subject(
          {
            notificationType: 'chat_channel_mention',
            data: {},
            originUser: {
              profileSummary: {
                firstName: 'first',
                lastName: 'Last',
                profileImage: 'image-url',
              },
            },
          },
          {
            normalized: { channels: {} },
          }
        );

        expect(mappedNotification.originatingName).toEqual('first Last');
        expect(mappedNotification.originatingImageUrl).toEqual('image-url');
      });
    });

    describe('chat_channel_message_replied', () => {
      it('maps default properties', () => {
        const mappedNotification = subject(
          {
            id: 'notification-id',
            notificationType: 'chat_channel_message_replied',
            data: { chatId: 'chat-id' },
            createdAt: '2023-01-20T22:33:34.945Z',
            isUnread: true,
          },
          {
            normalized: { channels: {} },
          }
        );

        expect(mappedNotification.id).toEqual('notification-id');
        expect(mappedNotification.createdAt).toEqual('2023-01-20T22:33:34.945Z');
        expect(mappedNotification.isUnread).toBeTrue();
      });

      it('maps body with unknown info', () => {
        const mappedNotification = subject(
          {
            notificationType: 'chat_channel_message_replied',
            data: { chatId: 'chat-id' },
          },
          {
            normalized: {
              channels: {},
            },
          }
        );

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
          {
            normalized: {
              channels: {
                'chat-id': { id: 'chat-id', name: 'TestingChannel' },
              },
            },
          }
        );

        expect(mappedNotification.body).toEqual('Johnny Chatter replied to you in #TestingChannel');
      });

      it('maps sender', () => {
        const mappedNotification = subject(
          {
            notificationType: 'chat_channel_message_replied',
            data: {},
            originUser: {
              profileSummary: {
                firstName: 'first',
                lastName: 'Last',
                profileImage: 'image-url',
              },
            },
          },
          {
            normalized: { channels: {} },
          }
        );

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

    describe('chat_dm_message_replied', () => {
      function conversationMention(attrs) {
        return {
          id: 'notification-id',
          notificationType: 'chat_dm_message_replied',
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
                lastName: 'Cash',
                profileImage: 'image-url',
              },
            },
          })
        );

        expect(mappedNotification.body).toEqual('Johnny Cash replied to you in a conversation');
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
});
