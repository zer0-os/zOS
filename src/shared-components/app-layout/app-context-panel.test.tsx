import React from 'react';

import { shallow } from 'enzyme';

import { AppContextPanel } from './app-context-panel';

describe('AppContextPanel', () => {
  const subject = (child = <div />) => {
    return shallow(<AppContextPanel>{child}</AppContextPanel>);
  };

  it('renders children', () => {
    const wrapper = subject(<div className='tacos' />);

    expect(wrapper.find('.app-context-panel .tacos').exists()).toBe(true);
  });
});
