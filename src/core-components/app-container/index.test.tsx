import React from 'react';
import { shallow } from 'enzyme';
import { Feed } from '../../apps/feed';

import { AppContainer, Apps, Properties } from '.';

describe('AppContainer', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps = {
      selectedApp: null,
      ...props,
    };

    return shallow(<AppContainer {...allProps} />);
  };

  test('renders Feed app when Feed app selected', () => {
    const wrapper = subject({ selectedApp: Apps.Feed });

    expect(wrapper.find(Feed).exists()).toBe(true); 
  });

  test('does not render Feed app if no app is selected', () => {
    const wrapper = subject({ selectedApp: null });

    expect(wrapper.find(Feed).exists()).toBe(false); 
  });
});
