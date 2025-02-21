import React from 'react';
import { shallow } from 'enzyme';

import { Container as Main, Properties } from './Main';
import { MessengerChat } from '../../components/messenger/chat';
import { MessengerFeed } from '../../components/messenger/feed';
import { JoiningConversationDialog } from '../../components/joining-conversation-dialog';

jest.mock('../../lib/web3/thirdweb/client', () => ({
  getThirdWebClient: jest.fn(),
  getChain: jest.fn(() => ({
    blockExplorers: [{ url: 'https://sepolia.etherscan.io' }],
  })),
}));

describe(Main, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      context: {
        isAuthenticated: false,
      },
      isValidConversation: false,
      isSocialChannel: false,
      isJoiningConversation: false,
      isConversationsLoaded: true,
      ...props,
    };

    return shallow(<Main {...allProps} />);
  };

  it('renders JoiningConversationDialog when isJoiningConversation is true and isValidConversation is false', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      isJoiningConversation: true,
      isValidConversation: false,
    });

    expect(wrapper).toHaveElement(JoiningConversationDialog);
  });

  it('does not render JoiningConversationDialog when isJoiningConversation is false and isValidConversation is true', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      isJoiningConversation: false,
      isValidConversation: true,
    });

    expect(wrapper).not.toHaveElement(JoiningConversationDialog);
  });

  it('renders direct message chat component when not a social channel, conversations loaded and is valid', () => {
    const wrapper = subject({ context: { isAuthenticated: true }, isValidConversation: true });

    expect(wrapper).toHaveElement(MessengerChat);
  });

  it('should not render messenger chat container when conversations have not loaded', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      isSocialChannel: true,
      isValidConversation: true,
      isConversationsLoaded: false,
    });

    expect(wrapper).not.toHaveElement(MessengerChat);
  });

  it('should not render messenger chat container when is not valid conversation', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      isSocialChannel: false,
      isValidConversation: false,
      isConversationsLoaded: false,
    });

    expect(wrapper).not.toHaveElement(MessengerFeed);
  });

  it('renders messenger feed container when is social channel, conversations loaded and is valid conversation', () => {
    const wrapper = subject({ context: { isAuthenticated: true }, isSocialChannel: true, isValidConversation: true });

    expect(wrapper).toHaveElement(MessengerFeed);
  });

  it('should not render messenger feed container when is not social channel ', () => {
    const wrapper = subject({ context: { isAuthenticated: true }, isSocialChannel: false, isValidConversation: true });

    expect(wrapper).not.toHaveElement(MessengerFeed);
  });

  it('should not render messenger feed container when conversations have not loaded', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      isSocialChannel: true,
      isValidConversation: true,
      isConversationsLoaded: false,
    });

    expect(wrapper).not.toHaveElement(MessengerFeed);
  });

  it('should not render messenger feed container when is not valid conversation', () => {
    const wrapper = subject({ context: { isAuthenticated: true }, isSocialChannel: true, isValidConversation: false });

    expect(wrapper).not.toHaveElement(MessengerFeed);
  });
});
