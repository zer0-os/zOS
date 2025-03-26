import React from 'react';
import { shallow } from 'enzyme';

import { Container as Main, Properties } from './Main';
import { MessengerChat } from '../../components/messenger/chat';
import { MembersSidekick } from '../../components/sidekick/variants/members-sidekick';

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
      isSecondarySidekickOpen: false,
      ...props,
    };

    return shallow(<Main {...allProps} />);
  };

  it('renders direct message chat component when conversations loaded and is valid', () => {
    const wrapper = subject({ context: { isAuthenticated: true }, isValidConversation: true });

    expect(wrapper).toHaveElement(MessengerChat);
  });

  it('should render members sidekick when is secondary sidekick open', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      isSecondarySidekickOpen: true,
      isConversationsLoaded: true,
    });

    expect(wrapper).toHaveElement(MembersSidekick);
  });
});
