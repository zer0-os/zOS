import React from 'react';

import { shallow } from 'enzyme';

import { AppContent, Properties } from './app-content';

describe('AppContent', () => {
  const subject = (props: Properties = {}, child = <div />) => {
    return shallow(<AppContent {...props}>{child}</AppContent>);
  };

  it('renders children', () => {
    const wrapper = subject({}, <div className='tacos' />);

    expect(wrapper.find('.app-content .tacos').exists()).toBe(true);
  });

  it('adds className', () => {
    const wrapper = subject({ className: 'what' });

    expect(wrapper.find('.app-content').hasClass('what')).toBe(true);
  });
});
