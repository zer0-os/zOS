import React from 'react';
import { shallow } from 'enzyme';

import { App } from '@zer0-os/zos-feed';
import { AppSandbox } from '.';
import { Apps } from '../lib/apps';

describe('AppSandbox', () => {
  const subject = (props: any) => {
    const allProps = {
      znsRoute: '',
      selectedApp: null,
      hasOverlayDispaly: false,
      isOpen: false,
      ...props,
    };

    return shallow(<AppSandbox {...allProps} />);
  };

  it('renders Feed app container when Feed app selected', () => {
    const wrapper = subject({ selectedApp: Apps.Feed });

    expect(wrapper.find(App).exists()).toBe(true); 
  });

  it('does not render Feed app container if no app is selected', () => {
    const wrapper = subject({ selectedApp: null });

    expect(wrapper.find(App).exists()).toBe(false); 
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

  it.only('renders overlay container when search selected', () => {
    const wrapper = subject({ hasOverlayDispaly: true, isOpen: true });

    expect(wrapper.find('.overlay_overlay').exists()).toBe(true); 

    wrapper.setProps({ hasOverlayDispaly: false, isOpen: false });

    expect(wrapper.find('.overlay_overlay').exists()).toBe(false); 
  });
});
