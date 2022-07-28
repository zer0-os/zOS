import React from 'react';

import { shallow } from 'enzyme';

import { ChannelView } from './channel-view';
import { Message } from './message';

describe('ChannelView', () => {
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
    const messages = [
      { id: 'message-one', message: 'what' },
      { id: 'message-two', message: 'hello' },
    ];

    const wrapper = subject({ messages });

    const ids = wrapper.find(Message).map((m) => m.prop('id'));

    expect(ids).toIncludeAllMembers([
      'message-one',
      'message-two',
    ]);
  });

  it('passes message prop to Message', () => {
    const messages = [
      { id: 'message-one', message: 'what' },
      { id: 'message-two', message: 'hello' },
    ];

    const wrapper = subject({ messages });

    const messageTextes = wrapper.find(Message).map((m) => m.prop('message'));

    expect(messageTextes).toIncludeAllMembers([
      'what',
      'hello',
    ]);
  });
});
