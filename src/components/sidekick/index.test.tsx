import React from 'react';
import { shallow } from 'enzyme';

import { Container } from '.';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { MessengerList } from '../messenger/list';

describe('Sidekick', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      className: '',
      updateSidekick: jest.fn(),
      setActiveSidekickTab: jest.fn(),
      syncSidekickState: jest.fn(),
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('sync state', () => {
    const syncSidekickState = jest.fn();
    subject({ syncSidekickState });

    expect(syncSidekickState).toHaveBeenCalled();
  });

  it('adds className', () => {
    const wrapper = subject({ className: 'todo' });

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    expect(ifAuthenticated.find('.todo').exists()).toBe(true);
  });

  it('renders sidekick with class animation in', () => {
    const wrapper = subject({ isOpen: true });

    const sidekick = wrapper.find('.sidekick');

    expect(sidekick.hasClass('sidekick--slide-in')).toBe(true);
  });

  it('it should not render out class animation', () => {
    const wrapper = subject({ isOpen: false });

    const sidekick = wrapper.find('.sidekick');

    expect(sidekick.hasClass('sidekick--slide-out')).toBe(false);
  });

  it('renders sidekick panel', () => {
    const wrapper = subject();

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    expect(ifAuthenticated.find('.app-sidekick-panel__target').exists()).toBe(true);
  });

  it('renders sidekick when panel tab is clicked', () => {
    const updateSidekick = jest.fn();
    const wrapper = subject({ updateSidekick, isOpen: false });

    expect(wrapper.find('.sidekick').hasClass('sidekick--slide-out')).toBe(false);

    wrapper.find('.app-sidekick-panel__target').simulate('click');

    expect(updateSidekick).toHaveBeenCalledWith({ isOpen: true });
  });

  it('render messages tab content', () => {
    const wrapper = subject();

    expect(wrapper.find(MessengerList).exists()).toBe(true);
    expect(wrapper.find('.sidekick__tab-content--messages').exists()).toBe(true);
  });
});
