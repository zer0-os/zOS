/**
 * @jest-environment jsdom
 */

import React from 'react';

import { mount } from 'enzyme';
import { createStore } from 'redux';
import { reducer } from '../store/authentication';
import { IfAuthenticated } from './if-authenticated';
import { AuthenticationContext } from './authentication';
import { AuthenticationContextProvider } from './authentication-provider';

describe('AuthenticationProvider', () => {
  const ChildComponent = () => {
    return <></>;
  };

  const subject = (state: any = {}) => {
    const store = createStore(reducer, state);

    return mount(
      <AuthenticationContextProvider store={store}>
        <AuthenticationContext.Consumer>{(value) => <ChildComponent {...value} />}</AuthenticationContext.Consumer>
      </AuthenticationContextProvider>
    );
  };

  it('isAuthenticated when user data exists', () => {
    const wrapper = subject({ authentication: { user: { data: { id: 'user-id-is-present-when-authenticated' } } } });

    expect(wrapper.find(ChildComponent).prop('isAuthenticated')).toBeTrue();
  });

  it('not isAuthenticated when user missing', () => {
    const wrapper = subject({ authentication: { user: {} } });

    expect(wrapper.find(ChildComponent).prop('isAuthenticated')).toBeFalse();
  });
});
