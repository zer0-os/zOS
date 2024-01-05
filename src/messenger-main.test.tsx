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
});
