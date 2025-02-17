import React from 'react';
import { shallow } from 'enzyme';
import { Container } from './index';
import { NotificationItem } from './notification-item';
import { Header } from '../header';
import { Channel, DefaultRoomLabels } from '../../store/channels';

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

  it('renders header with correct title', () => {
    const wrapper = subject();
    const header = wrapper.find(Header);

    expect(header.exists()).toBe(true);
    expect(header.prop('title')).toBeTruthy();
  });

  it('renders toggle group with correct tabs', () => {
    const wrapper = subject();
    const toggleGroup = wrapper.find('ToggleGroup');

    expect(toggleGroup.exists()).toBe(true);
    expect(toggleGroup.prop('options')).toEqual([
      { key: 'all', label: 'All' },
      { key: 'highlights', label: 'Highlights' },
      { key: 'muted', label: 'Muted' },
    ]);
  });

  it('starts with All tab selected', () => {
    const wrapper = subject();
    expect(wrapper.state('selectedTab')).toBe('all');
  });

  it('filters conversations correctly for All tab', () => {
    const conversations = [
      {
        id: 'channel-1',
        unreadCount: { total: 3, highlight: 0 },
        name: 'Regular Chat',
        labels: [],
      },
      {
        id: 'channel-2',
        unreadCount: { total: 1, highlight: 1 },
        name: 'Muted Chat',
        labels: [DefaultRoomLabels.MUTE],
      },
    ] as Channel[];

    const wrapper = subject({ conversations, isConversationsLoaded: true });
    const notificationItems = wrapper.find(NotificationItem);

    expect(notificationItems).toHaveLength(1);
    expect(notificationItems.at(0).prop('conversation').id).toBe('channel-1');
  });

  it('filters conversations correctly for Highlights tab', () => {
    const conversations = [
      {
        id: 'channel-1',
        unreadCount: { total: 3, highlight: 0 },
        name: 'Regular Chat',
      },
      {
        id: 'channel-2',
        unreadCount: { total: 1, highlight: 1 },
        name: 'Highlighted Chat',
      },
    ] as Channel[];

    const wrapper = subject({ conversations, isConversationsLoaded: true });
    wrapper.setState({ selectedTab: 'highlights' });

    const notificationItems = wrapper.find(NotificationItem);
    expect(notificationItems).toHaveLength(1);
    expect(notificationItems.at(0).prop('conversation').id).toBe('channel-2');
    expect(notificationItems.at(0).prop('type')).toBe('highlight');
  });

  it('filters conversations correctly for Muted tab', () => {
    const conversations = [
      {
        id: 'channel-1',
        unreadCount: { total: 3, highlight: 0 },
        name: 'Regular Chat',
        labels: [],
      },
      {
        id: 'channel-2',
        unreadCount: { total: 1, highlight: 1 },
        name: 'Muted Chat',
        labels: [DefaultRoomLabels.MUTE],
      },
    ] as Channel[];

    const wrapper = subject({ conversations, isConversationsLoaded: true });
    wrapper.setState({ selectedTab: 'muted' });

    const notificationItems = wrapper.find(NotificationItem);
    expect(notificationItems).toHaveLength(2);
    expect(notificationItems.at(0).prop('conversation').id).toBe('channel-2');
    expect(notificationItems.at(0).prop('type')).toBe('total');
    expect(notificationItems.at(1).prop('conversation').id).toBe('channel-2');
    expect(notificationItems.at(1).prop('type')).toBe('highlight');
  });

  it('shows correct empty state message for each tab', () => {
    const wrapper = subject({ conversations: [], isConversationsLoaded: true });

    expect(wrapper.text()).toContain('No new notifications');

    wrapper.setState({ selectedTab: 'highlights' });
    expect(wrapper.text()).toContain('No new highlights');

    wrapper.setState({ selectedTab: 'muted' });
    expect(wrapper.text()).toContain('No notifications in muted conversations');
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
