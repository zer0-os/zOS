import React from 'react';
import { shallow } from 'enzyme';

import { NotificationItem, Properties } from '.';
import moment from 'moment';

describe('NotificationItem', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      title: '',
      body: '',
      createdAt: '',
      ...props,
    };

    return shallow(<NotificationItem {...allProps} />);
  };

  it('renders basic info', () => {
    const wrapper = subject({
      title: 'You were Notified',
      body: 'Here is the description',
    });

    expect(wrapper.find('h4').text()).toEqual('You were Notified');
    expect(wrapper.find('p').text()).toEqual('Here is the description');
  });

  it('renders basic info', () => {
    const wrapper = subject({
      createdAt: '2023-03-10T22:33:34.945Z',
    });

    const expectedTimeDescription = moment('2023-03-10T22:33:34.945Z').fromNow();

    expect(wrapper.find('.notification-item__timestamp').text()).toEqual(expectedTimeDescription);
  });

  it('renders Avatar', () => {
    const wrapper = subject({
      originatingName: 'Originating Name',
      originatingImageUrl: 'image-url',
    });

    const avatar = wrapper.find('Avatar');

    expect(avatar.prop('userFriendlyName')).toEqual('Originating Name');
    expect(avatar.prop('imageURL')).toEqual('image-url');
  });
});
