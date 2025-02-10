import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './messenger-main';
import { Main } from './Main';

jest.mock('../../lib/web3/thirdweb/client', () => ({
  getThirdWebClient: jest.fn(),
  getChain: jest.fn(() => ({
    blockExplorers: [{ url: 'https://sepolia.etherscan.io' }],
  })),
}));

describe('MessengerMain', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      match: { params: { conversationId: '' } },
      setActiveConversationId: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders the Main component', () => {
    const wrapper = subject();
    expect(wrapper.find(Main)).toHaveLength(1);
  });

  it('parses the conversationId from the url on mount', () => {
    const setActiveConversationId = jest.fn();
    subject({ setActiveConversationId, match: { params: { conversationId: '123' } } });

    expect(setActiveConversationId).toHaveBeenCalledWith({ id: '123' });
  });

  it('updates the conversation id when the route changes', () => {
    const setActiveConversationId = jest.fn();
    const wrapper = subject({
      setActiveConversationId,
      match: { params: { conversationId: '123' } },
    });

    expect(setActiveConversationId).toHaveBeenCalledWith({ id: '123' });
    jest.clearAllMocks();

    wrapper.setProps({ match: { params: { conversationId: '456' } } });
    expect(setActiveConversationId).toHaveBeenCalledWith({ id: '456' });
  });

  it('does not update the conversation id when the route does not change', () => {
    const setActiveConversationId = jest.fn();
    const wrapper = subject({
      setActiveConversationId,
      match: { params: { conversationId: '123' } },
    });

    expect(setActiveConversationId).toHaveBeenCalledWith({ id: '123' });
    jest.clearAllMocks();

    wrapper.setProps({ setActiveConversationId: jest.fn() }); // force prop change without changing `match`
    expect(setActiveConversationId).not.toHaveBeenCalled();
  });
});
