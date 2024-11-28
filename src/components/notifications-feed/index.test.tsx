import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './index';
import { NotificationItem } from './notification-item';
import { Header } from '../header';

describe('NotificationsFeed', () => {
  const mockNotifications = [
    {
      id: '1',
      content: { body: 'notification 1' },
      sender: { userId: 'user-1', firstName: 'Test' },
      createdAt: 1678861267433,
      roomId: 'room-1',
      type: 'reply' as any,
    },
    {
      id: '2',
      content: { body: 'notification 2' },
      sender: { userId: 'user-2', firstName: 'User' },
      createdAt: 1678861267434,
      roomId: 'room-2',
      type: 'reply' as any,
    },
  ];

  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      notifications: [],
      loading: false,
      error: null,
      fetchNotifications: jest.fn(),
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

  it('renders notifications when they exist', () => {
    const wrapper = subject({ notifications: mockNotifications } as any);
    const notificationItems = wrapper.find(NotificationItem);

    expect(notificationItems).toHaveLength(2);
    expect(notificationItems.at(0).prop('notification')).toEqual(mockNotifications[0]);
    expect(notificationItems.at(1).prop('notification')).toEqual(mockNotifications[1]);
  });

  it('calls fetchNotifications on mount', () => {
    const fetchNotifications = jest.fn();
    subject({ fetchNotifications });

    expect(fetchNotifications).toHaveBeenCalled();
  });

  it('calls openNotificationConversation when notification is clicked', () => {
    const openNotificationConversation = jest.fn();
    const wrapper = subject({
      notifications: mockNotifications,
      openNotificationConversation,
    } as any);

    wrapper.find(NotificationItem).first().prop('onClick')('room-1');

    expect(openNotificationConversation).toHaveBeenCalledWith('room-1');
  });

  it('gets correct oldest timestamp from notifications', () => {
    const wrapper = subject({ notifications: mockNotifications } as any);
    const instance = wrapper.instance() as Container;

    expect(instance.getOldestTimestamp(mockNotifications)).toBe(1678861267433);
  });
});
