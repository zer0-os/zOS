import React from 'react';

import { shallow } from 'enzyme';

import { ZnsLink } from '@zer0-os/zos-component-library';
import { Component } from './channel-list-link';

describe('ChannelListLink', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      to: 'link-to',
      ...props,
    };

    return shallow(<Component {...allProps} />);
  };

  it('renders Link', () => {
    const to = '/link';
    const wrapper = subject({ to });

    const link = wrapper.find(ZnsLink).prop('to');

    expect(link).toBe(to);
  });

  it('trigger click on mouse down', () => {
    const innerRef = {
      current: {
        click: jest.fn(),
      },
    };

    const wrapper = subject({ innerRef });

    const link = wrapper.find(ZnsLink);
    link.simulate('mouseDown');

    expect(innerRef.current.click).toHaveBeenCalledOnce();
  });

  it('passes className prop', () => {
    const wrapper = subject({ className: 'class-name' });

    expect(wrapper.find('.class-name').exists()).toBe(true);
  });
});
