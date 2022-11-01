import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { EthAddress, Button, WalletSelectModal, WalletType } from '@zer0-os/zos-component-library';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { Container } from '.';

describe('WalletManager', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      updateConnector: () => undefined,
      setWalletModalOpen: () => undefined,
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
    const wrapper = subject();

    wrapper.setProps({
      connectionStatus: ConnectionStatus.Connected,
      currentConnector: Connectors.Metamask,
      isAuthenticated: true,
    });

    expect(wrapper.find(Button).exists()).toBe(false);
  });

  it('renders wallet address when set', () => {
    const currentAddress = '0x0000000000000000000000000000000000000001';

    const wrapper = subject({ currentAddress, isAuthenticated: true });

    expect(wrapper.find(EthAddress).prop('address')).toBe(currentAddress);
  });

  it('does not render wallet address when not set', () => {
    const currentAddress = '';

    const wrapper = subject({ currentAddress, isAuthenticated: false });

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
    const wrapper = subject({ connectionStatus: ConnectionStatus.Connected, isWalletModalOpen: true });

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

  it('calls update connector when disconnect btn clicked', () => {
    const updateConnector = jest.fn();
    const currentAddress = '0x0000000000000000000000000000000000000001';

    const wrapper = subject({ updateConnector, currentAddress, isAuthenticated: true });

    wrapper.find(EthAddress).simulate('click');

    expect(updateConnector).toHaveBeenCalledWith('none');
  });

  it('render connect button after disconnected', () => {
    const updateConnector = jest.fn();
    const currentAddress = '0x0000000000000000000000000000000000000001';

    const wrapper = subject({ updateConnector, currentAddress, isAuthenticated: true });

    wrapper.find(EthAddress).simulate('click');

    wrapper.setProps({
      isAuthenticated: false,
    });

    expect(wrapper.find(Button).exists()).toBe(true);
  });

  it('passes isNotSupportedNetwork of true when network is not supported', () => {
    const wrapper = subject({ isWalletModalOpen: true });

    wrapper.setProps({
      connectionStatus: ConnectionStatus.NetworkNotSupported,
    });

    expect(wrapper.find(WalletSelectModal).prop('isNotSupportedNetwork')).toBe(true);
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
