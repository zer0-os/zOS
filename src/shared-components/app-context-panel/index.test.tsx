import React from 'react';

import { shallow } from 'enzyme';

import { AppContextPanel, Properties } from '.';

describe('AppContextPanel', () => {
  const subject = (props: Properties = {}, child = <div />) => {
    return shallow(<AppContextPanel {...props}>{child}</AppContextPanel>);
  };

  it('renders children', () => {
    const wrapper = subject({}, <div className='tacos' />);

    expect(wrapper.find('.app-context-panel .tacos').exists()).toBe(true);
  });
});
