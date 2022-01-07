import React from 'react';
import { shallow } from 'enzyme';

import { Dialog } from '../dialog';

import { WalletSelect } from '.';
import { WalletSelectModal } from './modal';
import {WalletType} from './wallets';

describe('WalletSelect/Modal', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      isConnecting: false,
      ...props,
    };

    return shallow(<WalletSelectModal {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'taco-launcher' });

    expect(wrapper.hasClass('taco-launcher')).toBe(true);
  });

  it('renders child', () => {
    const wrapper = subject();

    expect(wrapper.find(WalletSelect).exists()).toBe(true);
  });

  it('propagates onClose from Dialog', () => {
    const onClose = jest.fn();

    const wrapper = subject({ onClose });

    wrapper.find(Dialog).simulate('close');

    expect(onClose).toHaveBeenCalled();
  });

  it('passes wallets to child', () => {
    const wallets = [ WalletType.Portis ];

    const wrapper = subject({ wallets });

    expect(wrapper.find(WalletSelect).prop('wallets')).toStrictEqual(wallets);
  });

  it('passes onSelect to child', () => {
    const onSelect = () => undefined;

    const wrapper = subject({ onSelect });

    expect(wrapper.find(WalletSelect).prop('onSelect')).toStrictEqual(onSelect);
  });

  it('passes isConnecting to child', () => {
    const wrapper = subject({ isConnecting: true });

    expect(wrapper.find(WalletSelect).prop('isConnecting')).toBe(true);
  });
});
