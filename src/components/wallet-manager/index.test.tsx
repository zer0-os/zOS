import React from 'react';
import { shallow } from 'enzyme';
import {
  render,
  waitFor,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  EthAddress,
  Button,
  WalletSelectModal,
  WalletType,
} from '@zer0-os/zos-component-library';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { Container } from '.';

describe('WalletManager', () => {
  const defaultProps = {
    updateConnector: () => undefined,
  };
  const subject = (props: any = {}) => {
    const allProps = {
      ...defaultProps,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders connect button', () => {
    const wrapper = subject();

    const button = wrapper.find(Button);

    expect(button.hasClass('wallet-manager__connect-button')).toBe(true);
  });

  // this will be currentWallet dependent in the future, but at the moment we only support
  // metamask
  it('does not render connect button if Metamask is connected', () => {
    const wrapper = subject();

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
    const wrapper = subject();

    wrapper.find('.wallet-manager__connect-button').simulate('click');

    expect(wrapper.find(WalletSelectModal).exists()).toBe(true);
  });

  it('should render all available wallets', () => {
    const wrapper = subject();

    wrapper.find('.wallet-manager__connect-button').simulate('click');

    expect(wrapper.find(WalletSelectModal).prop('wallets')).toStrictEqual([
      WalletType.Metamask,
      WalletType.WalletConnect,
      WalletType.Coinbase,
      WalletType.Fortmatic,
      WalletType.Portis,
    ]);
  });

  it('passes isConnecting of true when connection status is Connecting', async () => {
    const user = userEvent.setup();

    render(
      <Container
        {...defaultProps}
        currentAddress=''
        currentConnector={Connectors.Metamask}
        connectionStatus={ConnectionStatus.Connecting}
      />
    );
    const button = await screen.findByTestId('connect-button');

    user.click(button);

    await waitFor(() => {
      const element = screen.getByText('Connecting...');
      expect(element).toBeInTheDocument();
    });
  });

  it('closes wallet select modal onClose', () => {
    const wrapper = subject();

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    wrapper.find(WalletSelectModal).simulate('close');

    expect(wrapper.find(WalletSelectModal).exists()).toBe(false);
  });

  it('calls update connector when wallet selected', () => {
    const updateConnector = jest.fn();

    const wrapper = subject({ updateConnector });

    wrapper.find('.wallet-manager__connect-button').simulate('click');
    wrapper.find(WalletSelectModal).simulate('select', Connectors.Metamask);

    expect(updateConnector).toHaveBeenCalledWith(Connectors.Metamask);
  });
});
