import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { EthAddress, Button, WalletSelectModal, WalletType } from '@zer0-os/zos-component-library';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { Container } from '.';
import { config } from '../../config';

describe('WalletManager', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      updateConnector: () => undefined,
      setWalletModalOpen: () => undefined,
      providerService: {
        get: () => ({
          provider: {
            sendAsync: jest.fn(),
          },
        }),
      },
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders connect button', () => {
    const wrapper = subject();

    const button = wrapper.find(Button);

    expect(button.hasClass('wallet-manager__connect-button')).toBe(true);
  });

  it('adds className', () => {
    const wrapper = subject({ className: 'tacos' });

    const component = wrapper.find('.wallet-manager');

    expect(component.hasClass('tacos')).toBe(true);
  });

  // this will be currentWallet dependent in the future, but at the moment we only support
  // metamask
  it('does not render connect button if Metamask is connected', () => {
    const wrapper = subject({
      currentAddress: '0x000',
    });

    wrapper.setProps({
      connectionStatus: ConnectionStatus.Connected,
      currentConnector: Connectors.Metamask,
    });

    expect(wrapper.find(Button).exists()).toBe(false);
  });

  it('renders wallet address when set', () => {
    const currentAddress = '0x0000000000000000000000000000000000000001';

    const wrapper = subject({ currentAddress });

    expect(wrapper.find(EthAddress).prop('address')).toBe(currentAddress);
  });

  it('does not render wallet address when not set', () => {
    const currentAddress = '';

    const wrapper = subject({ currentAddress });

    expect(wrapper.find(EthAddress).exists()).toBe(false);
  });

  it('does not render wallet select modal', () => {
    const wrapper = subject();

    expect(wrapper.find(WalletSelectModal).exists()).toBe(false);
  });

  it('renders wallet select modal when button is clicked', () => {
    const setWalletModalOpen = jest.fn();
    const wrapper = subject({ setWalletModalOpen });

    wrapper.find('.wallet-manager__connect-button').simulate('click');

    expect(setWalletModalOpen).toHaveBeenCalledWith(true);
  });

  it('should render all available wallets', () => {
    const wrapper = subject({ isWalletModalOpen: true });

    expect(wrapper.find(WalletSelectModal).prop('wallets')).toStrictEqual([
      WalletType.Metamask,
      WalletType.WalletConnect,
      WalletType.Coinbase,
      WalletType.Fortmatic,
      WalletType.Portis,
    ]);
  });

  it('passes isConnecting of true when connection status is Connecting', () => {
    const wrapper = subject({ isWalletModalOpen: true });

    wrapper.setProps({ connectionStatus: ConnectionStatus.Connecting });

    expect(wrapper.find(WalletSelectModal).prop('isConnecting')).toBe(true);
  });

  it('passes isConnecting of true when wallet selected', () => {
    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      isWalletModalOpen: true,
    });

    wrapper.find(WalletSelectModal).simulate('select', Connectors.Metamask);

    expect(wrapper.find(WalletSelectModal).prop('isConnecting')).toBe(true);
  });

  it('passes isConnecting of false when wallet selected and status becomes connected', () => {
    const wrapper = subject({
      connectionStatus: ConnectionStatus.Connected,
      isWalletModalOpen: true,
      currentAddress: '0x00',
    });

    wrapper.find(WalletSelectModal).simulate('select', Connectors.Metamask);

    wrapper.setProps({ connectionStatus: ConnectionStatus.Connecting });

    // assert pre-condition
    expect(wrapper.find(WalletSelectModal).prop('isConnecting')).toBe(true);

    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected });

    // re-open modal, as it will be closed at this point
    wrapper.find('.wallet-manager__connect-button').simulate('click');

    expect(wrapper.find(WalletSelectModal).prop('isConnecting')).toBe(false);
  });

  it('closes wallet select modal onClose', () => {
    const setWalletModalOpen = jest.fn();
    const wrapper = subject({ isWalletModalOpen: true, setWalletModalOpen });

    wrapper.find(WalletSelectModal).simulate('close');

    expect(setWalletModalOpen).toHaveBeenCalledWith(false);
  });

  it('closes wallet select modal when status is connected', () => {
    const setWalletModalOpen = jest.fn();
    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      isWalletModalOpen: true,
      setWalletModalOpen,
      currentAddress: '0x00',
    });

    // straight to Connected from Disconnected. we should not force this
    // to pass through Connecting
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected });

    expect(setWalletModalOpen).toHaveBeenCalledWith(false);
  });

  it('should show list of wallet when status is disconnected', () => {
    const wrapper = subject({ connectionStatus: ConnectionStatus.Connected, isWalletModalOpen: true });

    wrapper.find(WalletSelectModal).simulate('select', Connectors.Metamask);

    expect(wrapper.find(WalletSelectModal).prop('isConnecting')).toBe(true);

    wrapper.setProps({ connectionStatus: ConnectionStatus.Disconnected });

    expect(wrapper.find(WalletSelectModal).prop('isConnecting')).toBe(false);
  });

  it('calls update connector when wallet selected', () => {
    const updateConnector = jest.fn();

    const wrapper = subject({ updateConnector, isWalletModalOpen: true });

    wrapper.find(WalletSelectModal).simulate('select', Connectors.Metamask);

    expect(updateConnector).toHaveBeenCalledWith(Connectors.Metamask);
  });

  it('passes isNotSupportedNetwork of true when network is not supported', () => {
    const wrapper = subject({ isWalletModalOpen: true });

    wrapper.setProps({
      connectionStatus: ConnectionStatus.NetworkNotSupported,
    });

    expect(wrapper.find(WalletSelectModal).prop('isNotSupportedNetwork')).toBe(true);
  });

  it('call sendAsync to authorize the user', () => {
    const sendAsync = jest.fn();
    const authorize = jest.fn();
    const currentAddress = '0x00';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      isWalletModalOpen: true,
      currentAddress,
      providerService: {
        get: () => ({
          provider: {
            sendAsync,
          },
        }),
      },
      authorize,
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
    const authorize = jest.fn();
    const currentAddress = '0x00';
    const signedWeb3Token = '0x0098';

    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
      isWalletModalOpen: true,
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
      authorize,
    });
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected });

    expect(authorize).toHaveBeenCalledWith({ signedWeb3Token });
  });

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState(state);
    const getState = (state: any = {}) =>
      ({
        ...state,
        web3: getWeb3({
          ...(state.web3 || {}),
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

    test('status', () => {
      const state = subject(getState({ web3: getWeb3({ status: ConnectionStatus.Connected }) }));

      expect(state.connectionStatus).toEqual(ConnectionStatus.Connected);
    });

    test('currentAddress', () => {
      const address = '0x0000000000000000000000000000000000000002';

      const state = subject(getState({ web3: getWeb3({ value: { address } }) }));

      expect(state.currentAddress).toEqual(address);
    });

    test('currentConnector', () => {
      const currentConnector = Connectors.Fortmatic;

      const state = subject(getState({ web3: getWeb3({ value: { connector: currentConnector } }) }));

      expect(state.currentConnector).toEqual(Connectors.Fortmatic);
    });

    test('isNotSupportedNetwork', () => {
      const connectionStatus = ConnectionStatus.NetworkNotSupported;

      const state = subject(getState({ web3: getWeb3({ status: connectionStatus }) }));

      expect(state.connectionStatus).toEqual(connectionStatus);
    });

    test('isWalletModalOpen', () => {
      const isWalletModalOpenMock = true;
      const state = subject(getState({ web3: getWeb3({ isWalletModalOpen: isWalletModalOpenMock }) }));

      expect(state.isWalletModalOpen).toEqual(isWalletModalOpenMock);
    });
  });
});
