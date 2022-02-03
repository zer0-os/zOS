import React from 'react';
import { shallow } from 'enzyme';

import { Main } from './Main';
import { WalletManager } from './core-components/wallet-manager';
import { ThemeEngine } from './core-components/theme-engine';
import { ViewModeToggle } from './core-components/view-mode-toggle';

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
});
