import React from 'react';
import { shallow } from 'enzyme';

import { App } from '@zer0-os/zos-feed';
import { AppSandbox } from '.';
import { Apps } from '../lib/apps';
import { Chains } from '../lib/web3';
import { Channels } from '../platform-apps/channels';
import { AppLayoutContextProvider } from '@zer0-os/zos-component-library';
import { AppLayout } from '../store/layout';

describe('AppSandbox', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      znsRoute: '',
      selectedApp: null,
      layout: {} as AppLayout,
      updateLayout: () => undefined,
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

  it('sets context values from layout', () => {
    const layout = {
      isContextPanelOpen: false,
      hasContextPanel: true,
    };

    const wrapper = subject({ layout });

    const initialValue = wrapper.find(AppLayoutContextProvider).prop('value');

    expect(initialValue).toMatchObject(layout);
  });

  it('calls update layout with expected value when setIsContextPanelOpen is called', () => {
    const onUpdateLayout = jest.fn();

    const wrapper = subject({ onUpdateLayout });

    const context = wrapper.find(AppLayoutContextProvider).prop('value');

    context.setIsContextPanelOpen(true);

    expect(onUpdateLayout).toHaveBeenCalledWith({ isContextPanelOpen: true });
  });

  it('calls onUpdateLayout with expected value when setHasContextPanel is called', () => {
    const onUpdateLayout = jest.fn();

    const wrapper = subject({ onUpdateLayout });

    const context = wrapper.find(AppLayoutContextProvider).prop('value');

    context.setHasContextPanel(true);

    expect(onUpdateLayout).toHaveBeenCalledWith({ hasContextPanel: true });
  });

  it('adds classes for no context panel', () => {
    const wrapper = subject({
      layout: {
        hasContextPanel: false,
        isContextPanelOpen: false,
      },
    });

    const sandbox = wrapper.find('.app-sandbox');

    expect(sandbox.hasClass('context-panel-open')).toBe(false);
    expect(sandbox.hasClass('has-context-panel')).toBe(false);
  });

  it('sets classes when hasContextPanel is true', () => {
    const wrapper = subject({
      layout: {
        hasContextPanel: true,
        isContextPanelOpen: false,
      },
    });

    const sandbox = wrapper.find('.app-sandbox');

    expect(sandbox.hasClass('context-panel-open')).toBe(false);
    expect(sandbox.hasClass('has-context-panel')).toBe(true);
  });

  it('sets classes when isContextPanelOpen is true', () => {
    const wrapper = subject({
      layout: {
        hasContextPanel: true,
        isContextPanelOpen: true,
      },
    });

    const sandbox = wrapper.find('.app-sandbox');

    expect(sandbox.hasClass('context-panel-open')).toBe(true);
    expect(sandbox.hasClass('has-context-panel')).toBe(true);
  });

  it('sets scrollbarWith', () => {
    const layout = {
      scrollbarWidth: 50,
    };
    const sandboxRef = jest.fn();

    const wrapper = subject({ layout, sandboxRef });

    const sandbox = wrapper.find('.app-sandbox');

    expect(sandbox.props().style).toEqual({
      paddingLeft: layout.scrollbarWidth,
    });
  });
});
