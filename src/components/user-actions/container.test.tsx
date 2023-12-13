import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store/reducer';

import { Container, Properties } from './container';
import { normalize as normalizeChannelList } from '../../store/channels-list';
import { normalize as normalizeNotificationList } from '../../store/notifications';

describe('UserActionsContainer', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      userAddress: '',
      userImageUrl: '',
      userIsOnline: false,
      unreadConversationMessageCount: 0,
      unreadNotificationCount: 0,
      updateConversationState: (_) => undefined,
      onDisconnect: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders UserActions', () => {
    const wrapper = subject({
      userAddress: 'the-address',
      userImageUrl: 'image-url',
      userIsOnline: true,
      unreadConversationMessageCount: 7,
      unreadNotificationCount: 11,
    });

    expect(wrapper.find('UserActions').props()).toEqual(
      expect.objectContaining({
        userAddress: 'the-address',
        userImageUrl: 'image-url',
        userIsOnline: true,
        unreadConversationMessageCount: 7,
        unreadNotificationCount: 11,
      })
    );
  });

  describe('mapState', () => {
    const subject = (channels, notifications = []) => {
      const channelData = normalizeChannelList(channels);
      const notificationData = normalizeNotificationList(notifications);
      const state = {
        channelsList: { value: channelData.result },
        notificationsList: { value: notificationData.result },
        normalized: { ...channelData.entities, ...notificationData.entities },
      } as RootState;
      return Container.mapState(state);
    };

    test('unreadConversationMessageCount', () => {
      const state = subject([
        { id: 'convo-1', unreadCount: 2, isChannel: false },
        { id: 'channel-2', unreadCount: 11, isChannel: true },
        { id: 'convo-2', unreadCount: 5, isChannel: false },
      ]);

      expect(state.unreadConversationMessageCount).toEqual(7);
    });

    test('unreadNotificationCount', () => {
      const state = subject(
        [],
        [
          { id: 'notification-1', notificationType: 'chat_channel_mention', isUnread: true },
          { id: 'notification-2', notificationType: 'chat_channel_mention', isUnread: false },
          { id: 'notification-3', notificationType: 'chat_channel_mention', isUnread: true },
        ]
      );

      expect(state.unreadNotificationCount).toEqual(2);
    });
  });
});
