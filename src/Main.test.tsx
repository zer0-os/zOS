import React from 'react';
import { shallow } from 'enzyme';

import { Container as Main, Properties } from './Main';
import { WalletManager } from './components/wallet-manager';
import { ThemeEngine } from './components/theme-engine';
import { ViewModeToggle } from './components/view-mode-toggle';
import { AddressBarContainer } from './components/address-bar/container';
import { DirectMessageChat } from './platform-apps/channels/direct-message-chat';

describe('Main', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      isSidekickOpen: false,
      hasContextPanel: false,
      isContextPanelOpen: false,
      context: {
        isAuthenticated: false,
      },
      ...props,
    };

    return shallow(<Main {...allProps} />);
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

  it('does not set layout classes when values are false', () => {
    const wrapper = subject({
      hasContextPanel: false,
      isContextPanelOpen: false,
    });

    const main = wrapper.find('.main');

    expect(main.hasClass('has-context-panel')).toBe(false);
    expect(main.hasClass('context-panel-open')).toBe(false);
  });

  it('adds class when hasContextPanel is true', () => {
    const wrapper = subject({ hasContextPanel: true });

    expect(wrapper.find('.main').hasClass('has-context-panel')).toBe(true);
  });

  it('adds class when isContextPanelOpen is true', () => {
    const wrapper = subject({ isContextPanelOpen: true });

    expect(wrapper.find('.main').hasClass('context-panel-open')).toBe(true);
  });

  it('renders direct message chat component', () => {
    const wrapper = subject({ context: { isAuthenticated: true } });

    expect(wrapper.find(DirectMessageChat).exists()).toBe(true);
  });

  describe('mapState', () => {
    const subject = (state: any) =>
      Main.mapState({
        layout: {
          value: {
            isContextPanelOpen: false,
            hasContextPanel: false,
            ...(state?.layout?.value || {}),
          },
        },
      } as any);

    test('hasContextPanel', () => {
      const state = subject({
        layout: {
          value: { hasContextPanel: true },
        } as any,
      });

      expect(state.hasContextPanel).toBeTrue();
    });

    test('isContextPanelOpen', () => {
      const state = subject({
        layout: {
          value: { isContextPanelOpen: true },
        } as any,
      });

      expect(state.isContextPanelOpen).toBeTrue();
    });
  });
});
