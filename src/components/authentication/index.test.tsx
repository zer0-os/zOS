import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store/reducer';

import { ConnectionStatus, Connectors } from '../../lib/web3';
import { Container, Properties } from '.';
import { Redirect } from 'react-router-dom';
import { AuthenticationState } from '../../store/authentication/types';

describe('Authentication', () => {
  const USER_DATA = {
    id: '12',
  } as AuthenticationState['user']['data'];

  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      user: {
        isLoading: false,
        data: null,
      },
      fetchCurrentUserWithChatAccessToken: jest.fn(),
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('should fetch current user and chatAccessToken', () => {
    const fetchCurrentUserWithChatAccessToken = jest.fn();

    subject({
      fetchCurrentUserWithChatAccessToken,
    });

    expect(fetchCurrentUserWithChatAccessToken).toHaveBeenCalledOnce();
  });

  it('should not authorize when fetching is in progress', () => {
    const authorize = jest.fn();

    subject({
      user: {
        isLoading: true,
        data: null,
      },
    });

    expect(authorize).not.toHaveBeenCalled();
  });

  it('should not authorize when fetch is done and we have a user', () => {
    const authorize = jest.fn();

    subject({
      user: {
        isLoading: false,
        data: USER_DATA,
      },
    });

    expect(authorize).not.toHaveBeenCalled();
  });

  it('should set logged in state to false, if user is loaded but user data is still null, and redirects to login', () => {
    const wrapper = subject({
      user: {
        isLoading: true,
        data: null,
      },
    });

    wrapper.setProps({ user: { isLoading: false, data: null } }); // go from loading to loaded

    // check state
    expect(wrapper.state()).toStrictEqual({ isLoggedIn: false });

    // assert redirect
    expect(wrapper.find(Redirect).exists()).toBeTruthy();
    expect(wrapper.find(Redirect).prop('to')).toStrictEqual('/login');
  });

  it('should set logged in state to true, if user is loaded and user data is not null', () => {
    const wrapper = subject({
      user: {
        isLoading: true,
        data: null,
      },
    });

    wrapper.setProps({ user: { isLoading: false, data: USER_DATA } }); // go from loading to loaded

    expect(wrapper.state()).toStrictEqual({ isLoggedIn: true });

    // assert no redirect
    expect(wrapper.find(Redirect).exists()).toBeFalsy();
  });

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState(state);
    const getState = (state: any = {}) =>
      ({
        ...state,
        web3: getWeb3({
          ...(state.web3 || {}),
        }),
        authentication: getAuthentication({
          ...(state.authentication || {}),
        }),
      } as RootState);

    const getWeb3 = (web3: any = {}) => ({
      status: ConnectionStatus.Disconnected,
      ...(web3 || {}),
      value: {
        address: '0x0',
        connector: Connectors.None,
        ...(web3.value || {}),
      },
    });

    const getAuthentication = (authentication: any = {}) => ({
      user: {
        isLoading: false,
        data: null,
      },
      ...(authentication || {}),
    });

    test('user', () => {
      const user = {
        isLoading: false,
        data: USER_DATA,
      };

      const state = subject(getState({ authentication: getAuthentication({ user }) }));

      expect(state.user).toEqual(user);
    });
  });
});
