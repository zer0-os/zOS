import React from 'react';
import { shallow } from 'enzyme';

import { WalletType, Wallet } from './wallets';
import { WalletSelect } from '.';

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
    const wrapper = subject({ isConnecting: true, wallets: [ WalletType.Metamask ] });

    expect(wrapper.find('.wallet-select__wallet').exists()).toBe(false);
  });

  it('does renders connecting indicator when connecting', () => {
    const wrapper = subject({ isConnecting: true, wallets: [ WalletType.Metamask ] });

    expect(wrapper.find('.wallet-select__connecting-indicator').exists()).toBe(true);
  });

  it('renders a single wallet', () => {
    const wrapper = subject({ wallets: [ WalletType.Metamask ] });

    const renderedName = wrapper.find('.wallet-select__wallet-name').at(0);

    expect(renderedName.text().trim()).toBe('Metamask');
  });

  it('defaults to all wallets', () => {
    const wrapper = subject();

    const renderedNames = wrapper
      .find('.wallet-select__wallet-name')
      .map(element => element.text().trim());

    expect(renderedNames).toIncludeSameMembers([
      'Wallet Connect',
      'Metamask',
      'Coinbase Wallet',
      'Fortmatic',
      'Portis',
    ]);
  });

  it('fires onSelect when wallet clicked', () => {
    const onSelect = jest.fn();
    const wallets = [WalletType.Metamask];

    const wrapper = subject({ wallets, onSelect });

    wrapper.find('.wallet-select__wallet').at(0).simulate('click');

    expect(onSelect).toHaveBeenCalledWith(WalletType.Metamask);
  });
});
