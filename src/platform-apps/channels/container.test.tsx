import React from 'react';

import { shallow } from 'enzyme';

import { ChannelsContainer } from './container';
import { Connect } from './connect';

describe('ChannelsContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      user: {},
      ...props,
    };

    return shallow(<ChannelsContainer {...allProps} />);
  };

  it('renders connect component if no user account present', () => {
    const wrapper = subject({ user: { account: '' } });

    expect(wrapper.find(Connect).exists()).toBe(true);
  });

  it('passes account to connect component', () => {
    const wrapper = subject({ user: { account: '0x000000000000000000000000000000000000000A' } });

    expect(wrapper.find(Connect).prop('account')).toStrictEqual('0x000000000000000000000000000000000000000A');
  });
});
