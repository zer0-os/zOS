import React from 'react';
import { shallow } from 'enzyme';

import { RootState } from '../../../store';
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
});
