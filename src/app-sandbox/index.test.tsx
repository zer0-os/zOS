import React from 'react';
import { shallow } from 'enzyme';

import { App } from '@zer0-os/zos-feed';
import { AppSandbox, Apps } from '.';

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

  it('does not render Feed app container if no app is selected', () => {
    const wrapper = subject({ selectedApp: null });

    expect(wrapper.find(App).exists()).toBe(false); 
  });

  it('passes route to feed app', () => {
    const wrapper = subject({ selectedApp: Apps.Feed, znsRoute: 'food.tacos' });

    expect(wrapper.find(App).prop('route')).toStrictEqual('food.tacos');
  });

  it('passes provider to feed app', () => {
    const web3Provider = { chain: '7' };

    const wrapper = subject({ selectedApp: Apps.Feed, web3Provider });

    expect(wrapper.find(App).prop('provider')).toStrictEqual(web3Provider);
  });
});
