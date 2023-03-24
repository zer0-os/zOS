import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { ConnectionStatus, Connectors } from '../../lib/web3';
import { Container } from '.';

describe('Authentication', () => {
  const USER_DATA = {
    userId: '12',
  };

  let signedWeb3Token = '0x0098';

  const subject = (props: any = {}) => {
    const allProps = {
      providerService: {
        get: () => ({
          provider: {
            sendAsync: jest.fn(),
          },
        }),
      },
      user: {
        isLoading: false,
        data: null,
      },
      fetchCurrentUserWithChatAccessToken: jest.fn(),
      clearSession: jest.fn(),
      personalSignToken: jest.fn().mockResolvedValue(signedWeb3Token),
      updateConnector: jest.fn(),
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

  it('when the account in metamask is changed verify we retrieve a new signed token', async () => {
    const personalSignToken = jest.fn().mockRejectedValue('0x0093');

    const currentAddress = '0x00';
    const changedAddress = '0x95';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Connected,
      currentAddress,
      user: {
        isLoading: false,
        data: USER_DATA,
      },
      personalSignToken,
    });

    await wrapper.setProps({ connectionStatus: ConnectionStatus.Connected, currentAddress: changedAddress });

    expect(personalSignToken).toHaveBeenCalledWith(expect.any(Object), changedAddress);
  });

  it('should authorize the user using the signedWeb3Token', async () => {
    const nonceOrAuthorize = jest.fn();
    const currentAddress = '0x00';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,

      nonceOrAuthorize,
    });

    await wrapper.setProps({ connectionStatus: ConnectionStatus.Connected, currentAddress });

    await new Promise(setImmediate);

    expect(nonceOrAuthorize).toHaveBeenCalledWith({ signedWeb3Token });
  });

  it('should call updateConnector when sendAsync return error', async () => {
    const updateConnector = jest.fn();
    const nonceOrAuthorize = jest.fn();
    const currentAddress = '0x00';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      personalSignToken: jest.fn().mockRejectedValue('error'),

      updateConnector,
      nonceOrAuthorize,
    });

    await wrapper.setProps({ connectionStatus: ConnectionStatus.Connected, currentAddress });

    await new Promise(setImmediate);

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
