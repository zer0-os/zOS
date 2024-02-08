import React from 'react';
import { shallow } from 'enzyme';

import { WalletSelect } from '.';
import { WalletType } from './wallets';

describe('WalletSelect', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<WalletSelect {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'taco-launcher' });

    expect(wrapper.hasClass('taco-launcher')).toBe(true);
  });

  it('does not render wallets when connecting', () => {
    const wrapper = subject({ isConnecting: true, wallets: [WalletType.Metamask] });

    expect(wrapper.find('.zos-wallet-select__wallet').exists()).toBe(false);
  });

  it('does renders connecting indicator when connecting', () => {
    const wrapper = subject({ isConnecting: true, wallets: [WalletType.Metamask] });

    expect(wrapper.find('.zos-wallet-select__connecting-indicator').exists()).toBe(true);
  });

  it('does not render walletSelectTitle by default', () => {
    const wrapper = subject();

    expect(wrapper).not.toHaveElement('.zos-wallet-select__title');
  });

  it('renders title when walletSelectTitle is provided', () => {
    const title = 'Connect To A Wallet';
    const wrapper = subject({ walletSelectTitle: title });

    expect(wrapper.find('.zos-wallet-select__title').text()).toBe(title);
  });

  it('does not render footer when connecting', () => {
    const wrapper = subject({ isConnecting: true, wallets: [WalletType.Metamask] });

    expect(wrapper).not.toHaveElement('.zos-wallet-select__footer');
  });

  it('renders a single wallet', () => {
    const wrapper = subject({ wallets: [WalletType.Metamask] });

    const renderedName = wrapper.find('.zos-wallet-select__wallet-name').at(0);

    expect(renderedName.text().trim()).toBe('Metamask');
  });

  it('defaults to all wallets', () => {
    const wrapper = subject();

    const renderedNames = wrapper.find('.zos-wallet-select__wallet-name').map((element) => element.text().trim());

    expect(renderedNames).toIncludeSameMembers([
      'Metamask',
      'Coinbase Wallet',
    ]);
  });

  it('fires onSelect when wallet clicked', () => {
    const onSelect = jest.fn();
    const wallets = [WalletType.Metamask];

    const wrapper = subject({ wallets, onSelect });

    wrapper.find('.zos-wallet-select__wallet-provider').at(0).simulate('click');

    expect(onSelect).toHaveBeenCalledWith(WalletType.Metamask);
  });
});
