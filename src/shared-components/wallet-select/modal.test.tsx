import React from 'react';
import { shallow } from 'enzyme';

import { Dialog } from '../dialog';

import { WalletSelect } from '.';
import { WalletSelectModal } from './modal';

describe('WalletSelect/Modal', () => {
  const subject = (props: any = {}) => {
    const allProps = {
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
});
