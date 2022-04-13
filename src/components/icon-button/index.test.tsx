import React from 'react';
import { shallow } from 'enzyme';

import { Icons } from './icons';
import { Component } from '.';

describe('IconButton', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      getIcon: () => <path />,
      onClick: () => undefined,
      ...props,
    };

    return shallow(<Component {...allProps} />);
  };

  it('adds className to main element', () => {
    const wrapper = subject({ className: 'tacos' });

    expect(wrapper.find('.icon-button').hasClass('tacos')).toBe(true);
  });

  it('adds class to svg element', () => {
    const wrapper = subject({ icon: Icons.ChevronLeft });

    expect(wrapper.find('svg.icon-button__icon').hasClass('zui-chevron-left')).toBe(true);
  });

  it('propagates click', () => {
    const onClick = jest.fn();

    const wrapper = subject({ onClick });

    wrapper.find('button').simulate('click');

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('adds icon to svg element', () => {
    const iconContent = <path className='the-icon' d="M5.35442 5.70699L1.28601" />;
    const getIcon = jest.fn((icon) => icon === Icons.ChevronLeft ? iconContent : <path />);

    const wrapper = subject({ getIcon, icon: Icons.ChevronLeft });

    expect(wrapper.find('svg.icon-button__icon .the-icon').exists()).toBe(true);
  });
});
