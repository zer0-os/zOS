import React from 'react';
import { shallow } from 'enzyme';

import { FeedContainer } from '../apps/feed/container';
import { AppSandbox, Apps } from '.';

describe('AppSandbox', () => {
  const subject = (props: any) => {
    const allProps = {
      znsRoute: '',
      selectedApp: null,
      ...props,
    };

    return shallow(<AppSandbox {...allProps} />);
  };

  it('renders Feed app container when Feed app selected', () => {
    const wrapper = subject({ selectedApp: Apps.Feed });

    expect(wrapper.find(FeedContainer).exists()).toBe(true); 
  });

  it('does not render Feed app container if no app is selected', () => {
    const wrapper = subject({ selectedApp: null });

    expect(wrapper.find(FeedContainer).exists()).toBe(false); 
  });
});
