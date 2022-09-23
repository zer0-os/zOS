import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { ConnectionStatus, Connectors } from '../../lib/web3';
import { ACCESS_TOKEN_COOKIE_NAME, Container } from '.';
import { config } from '../../config';

describe('Authentication', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      providerService: {
        get: () => ({
          provider: {
            sendAsync: jest.fn(),
          },
        }),
      },
      getFromCookie: jest.fn(),
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('set accessToken when a cookie is found', () => {
    const cookieValue = 'cookieValue';
    const getFromCookie = jest.fn().mockReturnValue(cookieValue);
    const setAccessToken = jest.fn();
    subject({
      getFromCookie,
      setAccessToken,
    });

    expect(setAccessToken).toHaveBeenCalledWith(cookieValue);
  });

  it('should get cookie', () => {
    const cookieValue = 'cookieValue';
    const getFromCookie = jest.fn().mockReturnValue(cookieValue);
    const setAccessToken = jest.fn();

    subject({
      getFromCookie,
      setAccessToken,
    });

    expect(getFromCookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE_NAME);
  });

  it('should not set accessToken when a cookie is NOT found', () => {
    const getFromCookie = jest.fn().mockReturnValue(null);
    const setAccessToken = jest.fn();
    subject({
      getFromCookie,
      setAccessToken,
    });

    expect(setAccessToken).not.toHaveBeenCalled();
  });

  it('should not authorize when no accessToken is saved', () => {
    const authorize = jest.fn();

    subject({
      accessToken: 'accessToken-test',
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
      accessToken: null,
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
      const accessToken = 'access-token-001';

      const state = subject(getState({ authentication: getAuthentication({ accessToken }) }));

      expect(state.accessToken).toEqual(accessToken);
    });
  });
});
