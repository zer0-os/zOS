import React from 'react';
import { shallow } from 'enzyme';

import { Properties, UserActions } from '.';

describe('UserActions', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      userImageUrl: '',
      userIsOnline: false,
      ...props,
    };

    return shallow(<UserActions {...allProps} />);
  };

  it('renders user avatar', () => {
    const wrapper = subject({ userImageUrl: 'image-url' });

    expect(wrapper.find('Avatar').props()).toContainEntries([
      [
        'type',
        'circle',
      ],
      [
        'size',
        'regular',
      ],
      [
        'imageURL',
        'image-url',
      ],
    ]);
  });

  it('renders user status when online', () => {
    const wrapper = subject({ userIsOnline: true });

    expect(wrapper.find('Avatar').prop('statusType')).toEqual('active');
  });

  it('renders user status when offline', () => {
    const wrapper = subject({ userIsOnline: false });

    expect(wrapper.find('Avatar').prop('statusType')).toEqual('offline');
  });

  it('opens and closes the notification list', () => {
    const wrapper = subject();

    wrapper.find('button').simulate('click');

    expect(wrapper.find('IconBell1').prop('isFilled')).toBeTrue();
    expect(wrapper.find('NotificationPopup').exists()).toBeTrue();

    wrapper.find('button').simulate('click');

    expect(wrapper.find('IconBell1').prop('isFilled')).toBeFalse();
    expect(wrapper.find('NotificationPopup').exists()).toBeFalse();
  });
});
