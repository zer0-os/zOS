import React from 'react';

import { shallow } from 'enzyme';

import { Connect } from './connect';

describe('channels/connect', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<Connect {...allProps} />);
  };

  it('renders message', () => {
    const wrapper = subject();

    expect(wrapper.find('.connect__message').text()).toBe('Please connect a wallet to continue.');
  });

  it('renders message when account is present', () => {
    const wrapper = subject({ account: '0x000000000000000000000000000000000000000A' });

    expect(wrapper.find('.connect__message').text()).toBe('Connecting with account [0x000000000000000000000000000000000000000A].');
  });
});
