import React from 'react';
import { shallow } from 'enzyme';
import { Main } from './Main';
import { AppContainer } from './core-components/app-container';

describe('Main', () => {
  const subject = () => {
    return shallow(<Main />);
  };

  test('renders AppContainer', () => {
    const wrapper = subject();

    expect(wrapper.find(AppContainer).exists()).toBe(true); 
  });
});
