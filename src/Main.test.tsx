import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';

import { Main } from './Main';
import { AppContainer, Apps } from './core-components/app-container';

describe('Main', () => {
  const subject = () => {
    return shallow(<Main />);
  };

  test('defaults selected app to Feed', () => {
    const wrapper = subject();

    expect(wrapper.find(AppContainer).prop('selectedApp')).toBe(Apps.Feed); 
  });

  it('links to root', () => {
    const wrapper = subject();

    const link = wrapper.find('.main__header').closest(Link);

    expect(link.prop('to')).toBe('/'); 
  });
});
