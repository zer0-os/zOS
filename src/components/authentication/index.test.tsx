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
      fetchCurrentUserWithChatAccessToken: jest.fn(),
      clearSession: jest.fn(),
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
    const nonceOrAuthorize = jest.fn();
    const currentAddress = '0x00';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      currentAddress: '',
      providerService: {
        get: () => ({
          provider: {
            sendAsync,
          },
        }),
      },
      nonceOrAuthorize,
      user: {
        isLoading: false,
        data: null,
      },
    });
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected, currentAddress });

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

  it('call sendAsync to authorize the user when account metamask is changed', () => {
    const sendAsync = jest.fn();
    const nonceOrAuthorize = jest.fn();
    const currentAddress = '0x00';
    const newCurrentAddress = '0x22';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Connected,
      currentAddress,
      providerService: {
        get: () => ({
          provider: {
            sendAsync,
          },
        }),
      },
      nonceOrAuthorize,
      user: {
        isLoading: false,
        data: USER_DATA,
      },
    });
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected, currentAddress: newCurrentAddress });

    expect(sendAsync).toHaveBeenCalledWith(
      {
        from: newCurrentAddress,
        method: 'personal_sign',
        params: [
          config.web3AuthenticationMessage,
          newCurrentAddress,
        ],
      },
      expect.any(Function)
    );
  });

  it('should authorize the user using the signedWeb3Token', () => {
    const nonceOrAuthorize = jest.fn();
    const currentAddress = '0x00';
    const signedWeb3Token = '0x0098';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      currentAddress: '',
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
      nonceOrAuthorize,
    });
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected, currentAddress });

    expect(nonceOrAuthorize).toHaveBeenCalledWith({ signedWeb3Token });
  });

  it('should call updateConnector when sendAsync return error', () => {
    const updateConnector = jest.fn();
    const nonceOrAuthorize = jest.fn();
    const currentAddress = '0x00';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      currentAddress: '',
      providerService: {
        get: () => ({
          provider: {
            sendAsync: (error, callback) => {
              callback({ error: 'error connection' }, null);
            },
          },
        }),
      },
      user: {
        isLoading: false,
        data: null,
      },
      updateConnector,
      nonceOrAuthorize,
    });
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected, currentAddress });

    expect(updateConnector).toHaveBeenCalledWith(Connectors.None);
    expect(nonceOrAuthorize).not.toHaveBeenCalled();
  });

  it('should call clearSession when disconnect btn clicked', () => {
    const clearSession = jest.fn();

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      user: {
        isLoading: false,
        data: USER_DATA,
      },
      clearSession,
    });
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected });

    expect(clearSession).toHaveBeenCalled();
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
