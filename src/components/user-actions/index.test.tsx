import React from 'react';
import { shallow } from 'enzyme';

import { Properties, UserActions } from '.';

describe('UserActions', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      userImageUrl: '',
      userIsOnline: false,
      isConversationListOpen: false,
      updateConversationState: (_) => undefined,
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

  it('opens the conversation list', () => {
    const updateConversationState = jest.fn();
    const wrapper = subject({ updateConversationState, isConversationListOpen: false });

    conversationButton(wrapper).simulate('click');

    expect(updateConversationState).toBeCalledWith(true);
  });

  it('closes the conversation list', () => {
    const updateConversationState = jest.fn();
    const wrapper = subject({ updateConversationState, isConversationListOpen: true });

    conversationButton(wrapper).simulate('click');

    expect(updateConversationState).toBeCalledWith(false);
  });

  it('renders conversation list closed', () => {
    const wrapper = subject({ isConversationListOpen: false });

    expect(wrapper.find('IconMessageSquare2').prop('isFilled')).toBeFalse();
  });

  it('renders conversation list open', () => {
    const wrapper = subject({ isConversationListOpen: true });

    expect(wrapper.find('IconMessageSquare2').prop('isFilled')).toBeTrue();
  });
});

function notificationButton(wrapper) {
  return wrapper.find('button').at(1);
}

function conversationButton(wrapper) {
  return wrapper.find('button').at(0);
}
