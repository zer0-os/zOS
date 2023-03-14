import React from 'react';
import { shallow } from 'enzyme';

import { NotificationList, Properties } from '.';

describe('NotificationList', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      list: [],
      ...props,
    };

    return shallow(<NotificationList {...allProps} />);
  };

  it('renders the list', () => {
    const wrapper = subject({
      list: [
        { id: 'id-1', notificationType: 'chat_channel_mention', createdAt: '2023-03-13T22:33:34.945Z' },
        { id: 'id-2', notificationType: 'chat_channel_mention', createdAt: '2023-01-20T22:33:34.945Z' },
      ],
    });

    // Temporary attributes match until we parse the channel name for this type of notification
    expect(wrapper.find('NotificationItem').map((n) => n.props())).toEqual([
      { title: 'Network Name', body: 'You were mentioned in', createdAt: '2023-03-13T22:33:34.945Z' },
      { title: 'Network Name', body: 'You were mentioned in', createdAt: '2023-01-20T22:33:34.945Z' },
    ]);
  });
});
