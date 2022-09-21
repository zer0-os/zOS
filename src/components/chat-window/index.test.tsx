import React from 'react';

import { shallow } from 'enzyme';

import { ChatWindow, Properties } from '.';
import { MessageInput } from './message-input';

describe('chat-window', () => {
  const subject = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
      className: '',
      isUserConnected: false,
      onSubmit: () => undefined,
      ...props,
    };

    return shallow(<ChatWindow {...allProps}>{child}</ChatWindow>);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'chat' });

    expect(wrapper.hasClass('chat')).toBeTrue();
  });

  it('it renders the messageInput', function () {
    const wrapper = subject({ className: 'chat', isUserConnected: true });

    expect(wrapper.find(MessageInput).exists()).toBe(true);
  });

  it('it not renders the messageInput if user disconnected', function () {
    const wrapper = subject({ className: 'chat' });

    expect(wrapper.find(MessageInput).exists()).toBe(false);
  });
});
