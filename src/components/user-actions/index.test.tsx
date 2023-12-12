import React from 'react';
import { shallow } from 'enzyme';

import { Properties, UserActions } from '.';

const featureFlags = { enableMatrix: false };
jest.mock('../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe('UserActions', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      userAddress: '',
      userImageUrl: '',
      userIsOnline: false,
      unreadConversationMessageCount: 0,
      unreadNotificationCount: 0,
      updateConversationState: () => undefined,
      onDisconnect: () => undefined,
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

    notificationButton(wrapper).simulate('click');

    expect(wrapper.find('IconBell1').prop('isFilled')).toBeTrue();
    expect(wrapper.find('NotificationPopup').exists()).toBeTrue();

    notificationButton(wrapper).simulate('click');

    expect(wrapper.find('IconBell1').prop('isFilled')).toBeFalse();
    expect(wrapper.find('NotificationPopup').exists()).toBeFalse();
  });

  it('does not render the notification count if it is zero', () => {
    const wrapper = subject({ unreadNotificationCount: 0 });

    expect(notificationButton(wrapper).find('.user-actions__badge').exists()).toBeFalse();
  });

  it('renders the notification count if it is greater than 0', () => {
    const wrapper = subject({ unreadNotificationCount: 7 });

    expect(notificationButton(wrapper).find('.user-actions__badge').text()).toEqual('7');
  });

  it('renders the notification count if it is greater than 9', () => {
    const wrapper = subject({ unreadNotificationCount: 10 });

    expect(notificationButton(wrapper).find('.user-actions__badge').text()).toEqual('9+');
  });

  it('does not render the message count if it is zero', () => {
    const wrapper = subject({ unreadConversationMessageCount: 0 });

    expect(conversationButton(wrapper).find('.user-actions__badge').exists()).toBeFalse();
  });

  it('renders the message count if it is greater than 0', () => {
    const wrapper = subject({ unreadConversationMessageCount: 7 });

    expect(conversationButton(wrapper).find('.user-actions__badge').text()).toEqual('7');
  });

  it('renders the message count if it is greater than 9', () => {
    const wrapper = subject({ unreadConversationMessageCount: 10 });

    expect(conversationButton(wrapper).find('.user-actions__badge').text()).toEqual('9+');
  });

  it('opens and closes the user menu', () => {
    const wrapper = subject({ userAddress: 'the-address' });

    userMenuButton(wrapper).simulate('click');

    const popup = wrapper.find('UserMenuPopup');
    expect(popup.prop('address')).toEqual('the-address');
    expect(popup.prop('isOpen')).toBeTrue();

    userMenuButton(wrapper).simulate('click');

    expect(wrapper.find('UserMenuPopup').prop('isOpen')).toBeFalse();
  });

  it('disconnects user wallet', () => {
    const onDisconnect = jest.fn();

    const wrapper = subject({ onDisconnect });
    userMenuButton(wrapper).simulate('click');
    wrapper.find('UserMenuPopup').simulate('disconnect');

    expect(onDisconnect).toHaveBeenCalledOnce();
  });
});

function notificationButton(wrapper) {
  return wrapper.find('button').at(1);
}

function conversationButton(wrapper) {
  return wrapper.find('button').at(0);
}

function userMenuButton(wrapper) {
  return wrapper.find('button').at(2);
}
