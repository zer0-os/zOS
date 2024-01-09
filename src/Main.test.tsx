import React from 'react';
import { shallow } from 'enzyme';

import { Container as Main, Properties } from './Main';
import { ThemeEngine } from './components/theme-engine';
import { MessengerChat } from './components/messenger/chat';

describe(Main, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      isMessengerFullScreen: false,
      context: {
        isAuthenticated: false,
      },
      ...props,
    };

    return shallow(<Main {...allProps} />);
  };

  it('renders theme engine', () => {
    const wrapper = subject();

    expect(wrapper).toHaveElement(ThemeEngine);
  });

  it('does not set layout classes when values are false', () => {
    const wrapper = subject({
      isMessengerFullScreen: false,
    });

    const main = wrapper.find('.main');

    expect(main.hasClass('messenger-full-screen')).toBe(false);
  });

  it('adds class when isMessengerFullScreen is true', () => {
    const wrapper = subject({ isMessengerFullScreen: true });

    expect(wrapper.find('.main').hasClass('messenger-full-screen')).toBe(true);
  });

  it('renders direct message chat component', () => {
    const wrapper = subject({ context: { isAuthenticated: true } });

    expect(wrapper).toHaveElement(MessengerChat);
  });

  it('does not render platform navigation if chat is full screen', () => {
    const wrapper = subject({ isMessengerFullScreen: true });

    expect(wrapper).not.toHaveElement('.main__navigation-platform');
  });

  it('does not render main header if chat is full screen', () => {
    const wrapper = subject({ isMessengerFullScreen: true });

    expect(wrapper).not.toHaveElement('.main__header');
  });

  describe('mapState', () => {
    const subject = (state: any) =>
      Main.mapState({
        layout: {
          value: {
            ...(state?.layout?.value || {}),
          },
        },
      } as any);

    test('isMessengerFullScreen', () => {
      const state = subject({
        layout: {
          value: { isMessengerFullScreen: true },
        } as any,
      });

      expect(state.isMessengerFullScreen).toBeTrue();
    });
  });
});
