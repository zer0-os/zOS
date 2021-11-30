import React from 'react';
import { shallow } from 'enzyme';
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
});
