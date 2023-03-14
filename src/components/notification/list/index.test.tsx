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
        { id: 'id-1', title: 'title-1', body: 'body-1', createdAt: '2023-03-13T22:33:34.945Z' },
        { id: 'id-2', title: 'title-2', body: 'body-2', createdAt: '2023-01-20T22:33:34.945Z' },
      ],
    });

    expect(wrapper.find('NotificationItem').map((n) => n.props())).toEqual([
      { title: 'title-1', body: 'body-1', createdAt: '2023-03-13T22:33:34.945Z' },
      { title: 'title-2', body: 'body-2', createdAt: '2023-01-20T22:33:34.945Z' },
    ]);
  });
});
