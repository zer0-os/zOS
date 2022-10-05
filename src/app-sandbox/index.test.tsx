import React from 'react';
import { shallow } from 'enzyme';

import { App } from '@zer0-os/zos-feed';
import { AppSandbox } from '.';
import { Apps } from '../lib/apps';
import { Chains } from '../lib/web3';
import { Channels } from '../platform-apps/channels';
import { AppLayoutContextProvider } from '@zer0-os/zos-component-library';

describe('AppSandbox', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      znsRoute: '',
      selectedApp: null,
      ...props,
    };

    return shallow(<AppSandbox {...allProps} />);
  };

  it('passes store to channels app', () => {
    const store: any = { what: 'no' };

    const wrapper = subject({ selectedApp: Apps.Channels, store });

    expect(wrapper.find(Channels).prop('store')).toStrictEqual(store);
  });

  it('does not pass store to feed app', () => {
    const store: any = { what: 'no' };

    const wrapper = subject({ selectedApp: Apps.Feed, store });

    expect(wrapper.find(App).prop('store')).toBeUndefined();
  });

  it('renders Feed app container when Feed app selected', () => {
    const wrapper = subject({ selectedApp: Apps.Feed });

    expect(wrapper.find(App).exists()).toBe(true);
  });

  it('renders error if no app is selected', () => {
    const wrapper = subject({ selectedApp: null });

    expect(wrapper.find('.app-sandbox__error').exists()).toBe(true);
  });

  it('passes AppInterface properties to Feed app', () => {
    const web3Provider = { chain: '7' };

    const wrapper = subject({
      selectedApp: Apps.Feed,
      web3Provider,
      znsRoute: 'food.tacos',
      chainId: Chains.MainNet,
      address: '0x0000000000000000000000000000000000000009',
    });

    expect(wrapper.find(App).props()).toMatchObject({
      provider: web3Provider,
      route: 'food.tacos',
      web3: {
        chainId: Chains.MainNet,
        address: '0x0000000000000000000000000000000000000009',
      },
    });
  });

  it('renders Channels app container when Channels app selected', () => {
    const wrapper = subject({ selectedApp: Apps.Channels });

    expect(wrapper.find(Channels).exists()).toBe(true);
  });

  it('passes user to Channels app', () => {
    const user = { account: '0x000000000000000000000000000000000000000A' };

    const wrapper = subject({ selectedApp: Apps.Channels, user });

    expect(wrapper.find(Channels).prop('user')).toStrictEqual(user);
  });

  it('passes route to feed app', () => {
    const znsRoute = 'food.tacos';

    const wrapper = subject({ selectedApp: Apps.Feed, znsRoute });

    expect(wrapper.find(App).prop('route')).toStrictEqual(znsRoute);
  });

  it('passes provider to feed app', () => {
    const web3Provider = { chain: '7' };

    const wrapper = subject({ selectedApp: Apps.Feed, web3Provider });

    expect(wrapper.find(App).prop('provider')).toStrictEqual(web3Provider);
  });

  it('passes connectWallet to feed app', () => {
    const web3 = { connectWallet: jest.fn() };

    const wrapper = subject({ selectedApp: Apps.Feed, connectWallet: web3.connectWallet });

    expect(wrapper.find(App).prop('web3')).toEqual(
      expect.objectContaining({
        connectWallet: web3.connectWallet,
      })
    );
  });

  it('sets default context values', () => {
    const wrapper = subject();

    const initialValue = wrapper.find(AppLayoutContextProvider).prop('value');

    expect(initialValue).toMatchObject({
      isContextPanelOpen: false,
      hasContextPanel: false,
    });
  });

  it('updates isContextPanelOpen when setIsContextPanelOpen is called', () => {
    const wrapper = subject();

    const context = wrapper.find(AppLayoutContextProvider).prop('value');

    context.setIsContextPanelOpen(true);

    const value = wrapper.find(AppLayoutContextProvider).prop('value');

    expect(value).toMatchObject({
      isContextPanelOpen: true,
      hasContextPanel: false,
    });
  });

  it('adds default classes for context panel', () => {
    const wrapper = subject();

    const sandbox = wrapper.find('.app-sandbox');

    expect(sandbox.hasClass('context-panel-open')).toBeFalse();
    expect(sandbox.hasClass('has-context-panel')).toBeFalse();
  });

  it('adds class when setHasContextPanel is called with true', () => {
    const wrapper = subject();

    const context = wrapper.find(AppLayoutContextProvider).prop('value');

    context.setHasContextPanel(true);

    const sandbox = wrapper.find('.app-sandbox');

    expect(sandbox.hasClass('has-context-panel')).toBeTrue();
  });

  it('removes class when app is updated', () => {
    const wrapper = subject({ selectedApp: Apps.DAOS });

    const context = wrapper.find(AppLayoutContextProvider).prop('value');

    context.setHasContextPanel(true);

    wrapper.setProps({ selectedApp: Apps.Feed });

    const sandbox = wrapper.find('.app-sandbox');

    expect(sandbox.hasClass('has-context-panel')).toBeFalse();
  });

  it('adds class when setIsContextPanelOpen is called with true', () => {
    const wrapper = subject();

    const context = wrapper.find(AppLayoutContextProvider).prop('value');

    context.setIsContextPanelOpen(true);

    const sandbox = wrapper.find('.app-sandbox');

    expect(sandbox.hasClass('context-panel-open')).toBeTrue();
  });

  it('updates hasContextPanel when setHasContextPanel is called', () => {
    const wrapper = subject();

    const context = wrapper.find(AppLayoutContextProvider).prop('value');

    context.setHasContextPanel(true);

    const value = wrapper.find(AppLayoutContextProvider).prop('value');

    expect(value).toMatchObject({
      isContextPanelOpen: false,
      hasContextPanel: true,
    });
  });
});
