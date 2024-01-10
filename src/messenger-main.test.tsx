import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './messenger-main';
import { Provider as AuthenticationContextProvider } from './components/authentication/context';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';
import { Main } from './Main';

describe('MessengerMain', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      isAuthenticated: false,
      match: { params: { conversationId: '' } },
      setActiveConversationId: () => null,
      validateActiveConversation: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('contains AuthenticationContextProvider with the correct context', () => {
    const wrapper = subject({ isAuthenticated: true });
    const provider = wrapper.find(AuthenticationContextProvider);
    expect(provider).toHaveLength(1);
    expect(provider.prop('value')).toEqual({ isAuthenticated: true });
  });

  it('contains the ZUIProvider', () => {
    const wrapper = subject();
    expect(wrapper.find(ZUIProvider)).toHaveLength(1);
  });

  it('renders the Main component', () => {
    const wrapper = subject();
    expect(wrapper.find(Main)).toHaveLength(1);
  });

  it('parses the conversationId from the url on mount', () => {
    const setActiveConversationId = jest.fn();
    subject({ setActiveConversationId, match: { params: { conversationId: '123' } } });

    expect(setActiveConversationId).toHaveBeenCalledWith('123');
  });

  it('updates the conversation id when the route changes', () => {
    const setActiveConversationId = jest.fn();
    const wrapper = subject({ setActiveConversationId, match: { params: { conversationId: '123' } } });

    expect(setActiveConversationId).toHaveBeenCalledWith('123');
    jest.clearAllMocks();

    wrapper.setProps({ match: { params: { conversationId: '456' } } });
    expect(setActiveConversationId).toHaveBeenCalledWith('456');
  });

  it('calls validate active conversation when the route changes', () => {
    const validateActiveConversation = jest.fn();
    const wrapper = subject({
      validateActiveConversation,
      match: { params: { conversationId: '123' } },
    });

    wrapper.setProps({ match: { params: { conversationId: '456' } } });
    expect(validateActiveConversation).toHaveBeenCalled();
  });

  it('does not update the conversation id when the route does not change', () => {
    const setActiveConversationId = jest.fn();
    const wrapper = subject({
      setActiveConversationId,
      match: { params: { conversationId: '123' } },
      isAuthenticated: true, // To allow us to force a property change
    });

    expect(setActiveConversationId).toHaveBeenCalledWith('123');
    jest.clearAllMocks();

    wrapper.setProps({ isAuthenticated: false }); // force prop change without changing `match`
    expect(setActiveConversationId).not.toHaveBeenCalled();
  });
});
