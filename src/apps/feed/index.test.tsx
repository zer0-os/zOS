import React from 'react';
import { shallow } from 'enzyme';
import { AppContainer, Apps } from '.';

describe('AppContainer', () => {
  const subject = () => {
    return shallow(<AppContainer />);
  };

  test('renders Feed app when Feed app selected', () => {
    const wrapper = subject({ selectedApp: Apps.Feed });

    expect(wrapper.find(Feed).exists()).toBe(true); 
  });
});
