import React from 'react';
import { shallow } from 'enzyme';
import { Container } from './messenger-main';
import { Provider as AuthenticationContextProvider } from './components/authentication/context';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';
import { Main } from './Main';

describe('MessengerMain', () => {
  const mockIsAuthenticated = true;

  const subject = (isAuthenticated = mockIsAuthenticated) => {
    return shallow(<Container isAuthenticated={isAuthenticated} />);
  };

  it('contains AuthenticationContextProvider with the correct context', () => {
    const wrapper = subject();
    const provider = wrapper.find(AuthenticationContextProvider);
    expect(provider).toHaveLength(1);
    expect(provider.prop('value')).toEqual({ isAuthenticated: mockIsAuthenticated });
  });

  it('contains the ZUIProvider', () => {
    const wrapper = subject();
    expect(wrapper.find(ZUIProvider)).toHaveLength(1);
  });

  it('renders the Main component', () => {
    const wrapper = subject();
    expect(wrapper.find(Main)).toHaveLength(1);
  });
});
