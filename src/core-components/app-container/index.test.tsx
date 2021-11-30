import React from 'react';
import { shallow } from 'enzyme';
import { FeedContainer } from '../../apps/feed/container';

import { AppContainer, Apps, Properties } from '.';

describe('AppContainer', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps = {
      selectedApp: null,
      ...props,
    };

    return shallow(<AppContainer {...allProps} />);
  };

  test('renders Feed app container when Feed app selected', () => {
    const wrapper = subject({ selectedApp: Apps.Feed });

    expect(wrapper.find(FeedContainer).exists()).toBe(true); 
  });

  test('does not render Feed app container if no app is selected', () => {
    const wrapper = subject({ selectedApp: null });

    expect(wrapper.find(FeedContainer).exists()).toBe(false); 
  });
});
