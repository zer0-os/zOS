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

  it('renders children', function () {
    const wrapper = subject({}, <div className='coffee-component' />);

    expect(wrapper.find('.coffee-component').exists()).toBe(true);
  });

  it('renders component with className', function () {
    const wrapper = subject({ className: 'coffee-list' });

    expect(wrapper.hasClass('coffee-list')).toBe(true);
  });

  it('applies scrollbar-hidden class if isScrollbarHidden', function () {
    const wrapper = subject({ isScrollbarHidden: true });

    expect(wrapper.hasClass('scrollbar-hidden')).toBe(true);
  });

  it('does not apply scrollbar-hidden class if isScrollbarHidden is false', function () {
    const wrapper = subject({ isScrollbarHidden: false });

    expect(wrapper.hasClass('scrollbar-hidden')).toBe(false);
  });
});
