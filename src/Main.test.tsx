import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';

import { Main } from './Main';
import { WalletManager } from './core-components/wallet-manager';

describe('Main', () => {
  const subject = () => {
    return shallow(<Main />);
  };

  it('renders wallet manager container', () => {
    const wrapper = subject();

    expect(wrapper.find(WalletManager).exists()).toBe(true);
  });
});
