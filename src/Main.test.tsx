import React from 'react';
import { shallow } from 'enzyme';
import { Main } from './Main';

describe('Main', () => {
  const subject = () => {
    return shallow(<Main />);
  };

  test('renders AppContainer', () => {
    const wrapper = subject();

    expect(wrapper.find(AppContainer).exists()).toBe(true); 
  });
});
