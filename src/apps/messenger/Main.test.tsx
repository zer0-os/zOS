import React from 'react';
import { shallow } from 'enzyme';

import { Container as Main, Properties } from './Main';
import { MessengerChat } from '../../components/messenger/chat';
import { MembersSidekick } from '../../components/sidekick/variants/members-sidekick';
import { LoadingScreenContainer } from '../../components/loading-screen';

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
      isJoiningConversation: false,
      isConversationsLoaded: true,
      ...props,
    };

    return shallow(<Main {...allProps} />);
  };

  it('renders direct message chat component when conversations loaded and is valid', () => {
    const wrapper = subject({ context: { isAuthenticated: true }, isValidConversation: true });

    expect(wrapper).toHaveElement(MessengerChat);
  });

  it('should render members sidekick', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      isConversationsLoaded: true,
    });

    expect(wrapper).toHaveElement(MembersSidekick);
  });

  it('renders LoadingScreenContainer when isJoiningConversation is true and isValidConversation is false', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      isJoiningConversation: true,
      isValidConversation: false,
    });

    expect(wrapper).toHaveElement(LoadingScreenContainer);
  });

  it('does not render LoadingScreenContainer when isJoiningConversation is false and isValidConversation is true', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      isJoiningConversation: false,
      isValidConversation: true,
    });

    expect(wrapper).not.toHaveElement(LoadingScreenContainer);
  });

  it('should not render messenger chat container when conversations have not loaded', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      isValidConversation: true,
      isConversationsLoaded: false,
    });

    expect(wrapper).not.toHaveElement(MessengerChat);
  });
});
