import React from 'react';

import { shallow } from 'enzyme';

import { ZnsLink } from '@zer0-os/zos-component-library';
import { ChannelListLink } from './channel-list-link';

describe('ChannelListLink', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<ChannelListLink {...allProps} />);
  };

  it('renders Link', () => {
    const to = '/link';
    const wrapper = subject({ to });

    const link = wrapper.find(ZnsLink).prop('to');

    expect(link).toBe(to);
  });

  it('passes className prop', () => {
    const wrapper = subject({ className: 'class-name' });

    expect(wrapper.find('.class-name').exists()).toBe(true);
  });
});
