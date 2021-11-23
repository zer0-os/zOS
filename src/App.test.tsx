import React from 'react';
import { shallow } from 'enzyme';
import App from './App';

describe('App', () => {
  const subject = () => {
    return shallow(<App />);
  };

  test('renders learn react link', () => {
    const wrapper = subject();

    const linkText = wrapper.find('a.App-link.learn').text().trim(); 

    expect(linkText).toStrictEqual('React');
  });
});
