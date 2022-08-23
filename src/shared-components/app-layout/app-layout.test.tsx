import React from 'react';

import { shallow } from 'enzyme';

import { AppLayout, Properties } from './app-layout';

describe('AppLayout', () => {
  const subject = (props: Properties = {}, child = <div />) => {
    return shallow(<AppLayout {...props}>{child}</AppLayout>);
  };

  it('renders children', () => {
    const wrapper = subject({}, <div className='tacos' />);

    expect(wrapper.find('.app-layout .tacos').exists()).toBe(true);
  });

  it('adds className', () => {
    const wrapper = subject({ className: 'what' });

    expect(wrapper.find('.app-layout').hasClass('what')).toBe(true);
  });
});
