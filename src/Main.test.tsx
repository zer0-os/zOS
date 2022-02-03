import React from 'react';
import { shallow } from 'enzyme';

import { Main } from './Main';
import { WalletManager } from './core-components/wallet-manager';
import { ThemeEngine, ViewModes } from './shared-components/theme-engine';

describe('Main', () => {
  const subject = () => {
    return shallow(<Main />);
  };

  it('renders wallet manager container', () => {
    const wrapper = subject();

    expect(wrapper.find(WalletManager).exists()).toBe(true);
  });

  it('defaults to dark mode', () => {
    const wrapper = subject();

    expect(wrapper.find(ThemeEngine).prop('viewMode')).toBe(ViewModes.Dark);
  });
});
