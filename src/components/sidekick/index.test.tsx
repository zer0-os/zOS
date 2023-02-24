import React from 'react';
import { shallow } from 'enzyme';

import { Container } from '.';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { MessengerList } from '../messenger/list';
import { SidekickTabs } from './types';

describe('Sidekick', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      className: '',
      updateSidekick: jest.fn(),
      setActiveSidekickTab: jest.fn(),
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

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

  it('handle network tab content', () => {
    const setActiveSidekickTab = jest.fn();
    const wrapper = subject({ setActiveSidekickTab });
    wrapper.find('.sidekick__tabs-network').simulate('click');

    expect(setActiveSidekickTab).toHaveBeenCalledWith({ activeTab: SidekickTabs.NETWORK });
  });

  it('handle messages tab content', () => {
    const setActiveSidekickTab = jest.fn();
    const wrapper = subject({ setActiveSidekickTab });
    wrapper.find('.sidekick__tabs-messages').simulate('click');

    expect(setActiveSidekickTab).toHaveBeenCalledWith({ activeTab: SidekickTabs.MESSAGES });
  });

  it('handle notifications tab content', () => {
    const setActiveSidekickTab = jest.fn();
    const wrapper = subject({ setActiveSidekickTab });
    wrapper.find('.sidekick__tabs-notifications').simulate('click');

    expect(setActiveSidekickTab).toHaveBeenCalledWith({ activeTab: SidekickTabs.NOTIFICATIONS });
  });

  it('render notifications tab content', () => {
    const wrapper = subject({ activeTab: SidekickTabs.NOTIFICATIONS });
    wrapper.find('.sidekick__tabs-notifications').simulate('click');

    expect(wrapper.find('.sidekick__tab-content--notifications').exists()).toBe(true);
  });

  it('render messages tab content', () => {
    const wrapper = subject({ activeTab: SidekickTabs.MESSAGES });
    wrapper.find('.sidekick__tabs-messages').simulate('click');

    expect(wrapper.find(MessengerList).exists()).toBe(true);
    expect(wrapper.find('.sidekick__tab-content--messages').exists()).toBe(true);
  });

  it('render network tab content', () => {
    const wrapper = subject({ activeTab: SidekickTabs.NETWORK });
    wrapper.find('.sidekick__tabs-network').simulate('click');

    expect(wrapper.find('.sidekick__tab-content--network').exists()).toBe(true);
  });

  it('renders total unread messages', () => {
    const wrapper = subject({ countAllUnreadMessages: 10 });

    expect(wrapper.find('.sidekick__tab-notifications--unread-messages').exists()).toBe(true);
  });
});
