import React from 'react';

import { shallow } from 'enzyme';

import InvertedScroll, { Properties } from '.';

describe('inverted-scroll', () => {
  const subject = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
      ...props,
    };

    return shallow(<InvertedScroll {...allProps}>{child}</InvertedScroll>);
  };

  it('renders component', function () {
    const wrapper = subject({});

    expect(wrapper.hasClass('scroll-container')).toBe(true);
    expect(wrapper.find('.scroll-container__content-wrapper').exists()).toBe(true);
    expect(wrapper.find('.scroll-container__children').exists()).toBe(true);
  });

  it('renders children', function () {
    const wrapper = subject({}, <div className='coffee-component' />);

    expect(wrapper.find('.coffee-component').exists()).toBe(true);
  });

  it('renders component with className', function () {
    const wrapper = subject({ className: 'coffee-list' });

    expect(wrapper.hasClass('coffee-list')).toBe(true);
  });
});
