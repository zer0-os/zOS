import React from 'react';
import { shallow } from 'enzyme';

import { Container as Main, Properties } from './Main';
import { MessengerChat } from '../../components/messenger/chat';
import { MessengerFeed } from '../../components/messenger/feed';

describe(Main, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      context: {
        isAuthenticated: false,
      },
      isValidConversation: false,
      isSocialChannel: false,
      isJoiningConversation: false,
      ...props,
    };

    return shallow(<Main {...allProps} />);
  };

  it('renders direct message chat component', () => {
    const wrapper = subject({ context: { isAuthenticated: true } });

    expect(wrapper).toHaveElement(MessengerChat);
  });

  it('renders messenger feed container when is social channel and is valid conversation', () => {
    const wrapper = subject({ context: { isAuthenticated: true }, isSocialChannel: true, isValidConversation: true });

    expect(wrapper).toHaveElement(MessengerFeed);
  });

  it('should not render messenger feed container when is not social channel', () => {
    const wrapper = subject({ context: { isAuthenticated: true }, isSocialChannel: false, isValidConversation: true });

    expect(wrapper).not.toHaveElement(MessengerFeed);
  });

  it('should not render messenger feed container when is not valid conversation', () => {
    const wrapper = subject({ context: { isAuthenticated: true }, isSocialChannel: true, isValidConversation: false });

    expect(wrapper).not.toHaveElement(MessengerFeed);
  });
});
