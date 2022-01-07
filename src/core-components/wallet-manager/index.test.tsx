import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { Button } from '../../shared-components/button';
import { WalletSelectModal } from '../../shared-components/wallet-select/modal';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { Container } from '.';
import { WalletType } from '../../shared-components/wallet-select/wallets';
import { EthAddress } from '../../shared-components/eth-address';

describe('WalletManager', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      updateConnector: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders connect button', () => {
    const wrapper = subject();

    const button = wrapper.find(Button);

    expect(button.hasClass('wallet-manager__connect-button')).toBe(true);
  });

  it('renders wallet address when set', () => {
    const currentAddress = '0x0000000000000000000000000000000000000001';

    const wrapper = subject({ currentAddress });

    expect(wrapper.find(EthAddress).prop('address')).toBe(currentAddress);
  });

  it('does not render wallet select modal', () => {
    const wrapper = subject();

    expect(wrapper.find(WalletSelectModal).exists()).toBe(false);
  });

  it('renders wallet select modal when button is clicked', () => {
    const wrapper = subject();

    wrapper.find('.wallet-manager__connect-button').simulate('click');

    expect(wrapper.find(WalletSelectModal).exists()).toBe(true);
  });

  it('limits wallet select modal to Metamask', () => {
    const wrapper = subject();

    wrapper.find('.wallet-manager__connect-button').simulate('click');

    expect(wrapper.find(WalletSelectModal).prop('wallets')).toStrictEqual([ WalletType.Metamask ]);
  });

  it('passes isConnecting of true when connection status is Connecting', () => {
    const wrapper = subject();

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connecting });

    expect(wrapper.find(WalletSelectModal).prop('isConnecting')).toBe(true);
  });

  it('passes isConnecting of true when wallet selected', () => {
    const wrapper = subject({ connectionStatus: ConnectionStatus.Disconnected });

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    wrapper.find(WalletSelectModal).simulate('select', Connectors.Metamask);

    expect(wrapper.find(WalletSelectModal).prop('isConnecting')).toBe(true);
  });

  it('closes wallet select modal onClose', () => {
    const wrapper = subject();

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    wrapper.find(WalletSelectModal).simulate('close');

    expect(wrapper.find(WalletSelectModal).exists()).toBe(false);
  });

  it('closes wallet select modal when status is connected', () => {
    const wrapper = subject({ connectionStatus: ConnectionStatus.Disconnected });

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    // straight to Connected from Disconnected. we should not force this
    // to pass through Connecting
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected })

    expect(wrapper.find(WalletSelectModal).exists()).toBe(false);
  });

  it('calls update connector when wallet selected', () => {
    const updateConnector = jest.fn();

    const wrapper = subject({ updateConnector });

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    wrapper.find(WalletSelectModal).simulate('select', Connectors.Metamask);

    expect(updateConnector).toHaveBeenCalledWith(Connectors.Metamask);
  });

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState(state);
    const getState = (state: any = {}) => ({
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
  });
});
