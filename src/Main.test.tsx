import React from 'react';
import { shallow } from 'enzyme';

import { Container as Main, Properties } from './Main';
import { MessengerChat } from './components/messenger/chat';
import { MainBackground } from './store/background';

describe(Main, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      context: {
        isAuthenticated: false,
      },
      selectedMainBackground: MainBackground.StaticGreenParticles,
      ...props,
    };

    return shallow(<Main {...allProps} />);
  };

  it('renders direct message chat component', () => {
    const wrapper = subject({ context: { isAuthenticated: true } });

    expect(wrapper).toHaveElement(MessengerChat);
  });

  it('renders animated background when not static', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      selectedMainBackground: MainBackground.AnimatedBlackParticles,
    });

    expect(wrapper.find('video.main-background-video')).toHaveLength(1);
  });

  it('does not render animated background when static', () => {
    const wrapper = subject({
      context: { isAuthenticated: true },
      selectedMainBackground: MainBackground.StaticGreenParticles,
    });

    expect(wrapper.find('video.main-background-video')).toHaveLength(0);
  });
});
