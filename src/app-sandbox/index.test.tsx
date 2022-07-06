import React from 'react';
import { shallow } from 'enzyme';

import { App } from '@zer0-os/zos-feed';
import { AppSandbox } from '.';
import { Apps } from '../lib/apps';
import { Chains } from '../lib/web3';
import { ChannelsContainer } from '../platform-apps/channels/container';

describe('AppSandbox', () => {
  const subject = (props: any) => {
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

    expect(wrapper.find(ChannelsContainer).prop('store')).toStrictEqual(store);
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

    expect(wrapper.find(ChannelsContainer).exists()).toBe(true);
  });

  it('passes user to Channels app', () => {
    const user = { account: '0x000000000000000000000000000000000000000A' };

    const wrapper = subject({ selectedApp: Apps.Channels, user });

    expect(wrapper.find(ChannelsContainer).prop('user')).toStrictEqual(user);
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
});
