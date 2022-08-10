import React from 'react';

import { shallow } from 'enzyme';

import { ChannelView } from './channel-view';
import { Message } from './message';

describe('ChannelView', () => {
  const MESSAGES_TEST = [
    { id: 'message-1', message: 'what', sender: { userId: 1 } },
    { id: 'message-2', message: 'hello', sender: { userId: 2 } },
    { id: 'message-3', message: 'hey', sender: { userId: 2 } },
    { id: 'message-4', message: 'ok!', sender: { userId: 2 } },
  ];

  const subject = (props: any = {}) => {
    const allProps = {
      name: '',
      messages: [],
      ...props,
    };

    return shallow(<ChannelView {...allProps} />);
  };

  it('renders channel name', () => {
    const wrapper = subject({ name: 'first channel' });

    const textes = wrapper.find('.channel-view__name h1').text().trim();

    expect(textes).toStrictEqual('Welcome to #first channel');
  });

  it('renders a message for each message', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    const ids = wrapper.find(Message).map((m) => m.prop('id'));

    expect(ids).toIncludeAllMembers([
      'message-1',
      'message-2',
      'message-3',
      'message-4',
    ]);
  });

  it('passes message prop to Message', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    const messageTextes = wrapper.find(Message).map((m) => m.prop('message'));

    expect(messageTextes).toIncludeAllMembers([
      'what',
      'hello',
      'hey',
      'ok!',
    ]);
  });

  it('passes isFirstFromUser prop to Message', () => {
    const wrapper = subject({ messages: MESSAGES_TEST });

    const isFirstFromUserProperties = wrapper.find(Message).map((m) => m.prop('isFirstFromUser'));

    expect(isFirstFromUserProperties).toIncludeAllMembers([
      true,
      true,
      false,
      false,
    ]);
  });
});
