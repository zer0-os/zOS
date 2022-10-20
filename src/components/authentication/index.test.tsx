import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { ConnectionStatus, Connectors } from '../../lib/web3';
import { Container } from '.';
import { config } from '../../config';

describe('Authentication', () => {
  const USER_DATA = {
    userId: '12',
  };

  const subject = (props: any = {}) => {
    const allProps = {
      providerService: {
        get: () => ({
          provider: {
            sendAsync: jest.fn(),
          },
        }),
      },
      fetchCurrentUser: jest.fn(),
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('should fetch current user', () => {
    const fetchCurrentUser = jest.fn();
    subject({
      fetchCurrentUser,
    });

    expect(fetchCurrentUser).toHaveBeenCalledOnce();
  });

  it('should not authorize when fetching is in progress', () => {
    const authorize = jest.fn();

    subject({
      user: {
        isLoading: true,
        data: null,
      },
      authorize,
    });

    expect(authorize).not.toHaveBeenCalled();
  });

  it('should not authorize when fetch is done and we have', () => {
    const authorize = jest.fn();

    subject({
      user: {
        isLoading: false,
        data: USER_DATA,
      },
      authorize,
    });

    expect(authorize).not.toHaveBeenCalled();
  });

  it('call sendAsync to authorize the user', () => {
    const sendAsync = jest.fn();
    const authorizeUser = jest.fn();
    const currentAddress = '0x00';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      currentAddress,
      providerService: {
        get: () => ({
          provider: {
            sendAsync,
          },
        }),
      },
      authorizeUser,
      user: {
        isLoading: false,
        data: null,
      },
    });
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected });

    expect(sendAsync).toHaveBeenCalledWith(
      {
        from: currentAddress,
        method: 'personal_sign',
        params: [
          config.web3AuthenticationMessage,
          currentAddress,
        ],
      },
      expect.any(Function)
    );
  });

  it('should authorize the user using the signedWeb3Token', () => {
    const authorizeUser = jest.fn();
    const currentAddress = '0x00';
    const signedWeb3Token = '0x0098';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      currentAddress,
      providerService: {
        get: () => ({
          provider: {
            sendAsync: (error, callback) => {
              callback(null, { result: signedWeb3Token });
            },
          },
        }),
      },
      user: {
        isLoading: false,
        data: null,
      },
      authorizeUser,
    });
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected });

    expect(authorizeUser).toHaveBeenCalledWith({ signedWeb3Token });
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

    test('status', () => {
      const state = subject(getState({ web3: getWeb3({ status: ConnectionStatus.Connected }) }));

      expect(state.connectionStatus).toEqual(ConnectionStatus.Connected);
    });

    test('currentAddress', () => {
      const address = '0x0000000000000000000000000000000000000002';

      const state = subject(getState({ web3: getWeb3({ value: { address } }) }));

      expect(state.currentAddress).toEqual(address);
    });

    test('accessToken', () => {
      const user = {
        isLoading: false,
        data: USER_DATA,
      };

      const state = subject(getState({ authentication: getAuthentication({ user }) }));

      expect(state.user).toEqual(user);
    });
  });
});
