import React from 'react';
import { shallow } from 'enzyme';

import { App } from '@zer0-os/zos-feed';
import { AppSandbox } from '.';
import { Apps } from '../lib/apps';
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

  it('renders Feed app container when Feed app selected', () => {
    const wrapper = subject({ selectedApp: Apps.Feed });

    expect(wrapper.find(App).exists()).toBe(true); 
  });

  it('renders error if no app is selected', () => {
    const wrapper = subject({ selectedApp: null });

    expect(wrapper.find('.app-sandbox__error').exists()).toBe(true); 
  });

  it('renders Channels app container when Channels app selected', () => {
    const wrapper = subject({ selectedApp: Apps.Channels });

    expect(wrapper.find(ChannelsContainer).exists()).toBe(true); 
  });

  it('passes route to feed app', () => {
    const znsRoute = 'food.tacos';
    const app = Apps.Feed;

    const wrapper = subject({ selectedApp: app, znsRoute });

    expect(wrapper.find(App).prop('route')).toStrictEqual({ app, znsRoute });
  });

  it('passes provider to feed app', () => {
    const web3Provider = { chain: '7' };

    const wrapper = subject({ selectedApp: Apps.Feed, web3Provider });

    expect(wrapper.find(App).prop('provider')).toStrictEqual(web3Provider);
  });
});
