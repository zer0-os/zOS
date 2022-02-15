import React from 'react';
import { shallow } from 'enzyme';

import { Main } from './Main';
import { WalletManager } from './components/wallet-manager';
import { ThemeEngine } from './components/theme-engine';
import { ViewModeToggle } from './components/view-mode-toggle';
import { AddressBarContainer } from './components/address-bar/container';

describe('Main', () => {
  const subject = () => {
    return shallow(<Main />);
  };

  it('renders wallet manager container', () => {
    const wrapper = subject();

    expect(wrapper.find(WalletManager).exists()).toBe(true);
  });

  it('renders view mode toggle', () => {
    const wrapper = subject();

    expect(wrapper.find(ViewModeToggle).exists()).toBe(true);
  });

  it('renders theme engine', () => {
    const wrapper = subject();

    expect(wrapper.find(ThemeEngine).exists()).toBe(true);
  });

  it('renders address bar container', () => {
    const wrapper = subject();

    expect(wrapper.find(AddressBarContainer).exists()).toBe(true);
  });
});
