import React from 'react';
import { shallow } from 'enzyme';
import { Container } from './index';
import { NotificationItem } from './notification-item';
import { Header } from '../header';
import { Channel } from '../../store/channels';

describe('NotificationsFeed', () => {
  const mockConversations: Channel[] = [
    {
      id: 'channel-1',
      unreadCount: { total: 3, highlight: 0 },
      name: 'Conversation 1',
      lastMessage: { content: 'Hello' },
    },
    {
      id: 'channel-2',
      unreadCount: { total: 1, highlight: 0 },
      name: 'Conversation 2',
      lastMessage: { content: 'Hi there' },
    },
  ] as any;

  const subject = (
    props: Partial<{
      conversations: Channel[];
      isConversationsLoaded: boolean;
      openNotificationConversation: (roomId: string) => void;
    }> = {}
  ) => {
    const allProps = {
      conversations: [],
      isConversationsLoaded: false,
      openNotificationConversation: jest.fn(),

      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders header with correct title and icon', () => {
    const wrapper = subject();
    const header = wrapper.find(Header);

    expect(header.exists()).toBe(true);
    expect(header.prop('title')).toBeTruthy();
    expect(header.prop('icon')).toBeTruthy();
  });

  it('renders notifications when conversations exist', () => {
    const wrapper = subject({
      conversations: mockConversations,
      isConversationsLoaded: true,
    });

    const notificationItems = wrapper.find(NotificationItem);
    expect(notificationItems).toHaveLength(2);
    expect(notificationItems.at(0).prop('conversation')).toEqual(mockConversations[0]);
    expect(notificationItems.at(1).prop('conversation')).toEqual(mockConversations[1]);
  });

  it('shows loading state when conversations are not loaded', () => {
    const wrapper = subject({ isConversationsLoaded: false });
    expect(wrapper.find('Spinner').exists()).toBe(true);
  });

  it('shows empty state when no conversations and loaded', () => {
    const wrapper = subject({
      conversations: [],
      isConversationsLoaded: true,
    });
    expect(wrapper.text()).toContain('No new notifications');
  });

  it('calls openNotificationConversation when notification is clicked', () => {
    const openNotificationConversation = jest.fn();
    const wrapper = subject({
      conversations: mockConversations,
      isConversationsLoaded: true,
      openNotificationConversation,
    });

    wrapper.find(NotificationItem).first().prop('onClick')('channel-1');
    expect(openNotificationConversation).toHaveBeenCalledWith('channel-1');
  });
});
