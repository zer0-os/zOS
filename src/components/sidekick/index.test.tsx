import React from 'react';
import { shallow } from 'enzyme';

import { Container } from '.';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { MessengerList } from '../messenger/list';

describe('Sidekick', () => {
  beforeAll(() => {
    global.localStorage = {
      setItem: jest.fn(),
      getItem: () => null,
      removeItem: () => {},
      length: 0,
      clear: () => {},
      key: (_) => '',
    };
  });

  const subject = (props: any = {}) => {
    const allProps = {
      className: '',
      updateSidekick: jest.fn(),
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'todo' });

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    expect(ifAuthenticated.find('.todo').exists()).toBe(true);
  });

  it('open the sidekick in case not data found in storage', () => {
    const updateSidekick = jest.fn();
    subject({ updateSidekick });

    expect(updateSidekick).toHaveBeenCalledWith({ isOpen: true });
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
    const wrapper = subject({ updateSidekick });

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    ifAuthenticated.find('.app-sidekick-panel__target').simulate('click');

    expect(ifAuthenticated.find('.sidekick--slide-out').exists()).toBe(false);

    expect(updateSidekick).toHaveBeenCalledWith({ isOpen: true });
  });

  it('renders default active tab', () => {
    const wrapper = subject();

    expect(wrapper.find(MessengerList).exists()).toBe(true);
  });

  it('handle network tab content', () => {
    const wrapper = subject();
    wrapper.find('.sidekick__tabs-network').simulate('click');

    expect(wrapper.find('.sidekick__tab-content--network').exists()).toBe(true);
  });

  it('handle messages tab content', () => {
    const wrapper = subject();
    wrapper.find('.sidekick__tabs-messages').simulate('click');

    expect(wrapper.find('.sidekick__tab-content--messages').exists()).toBe(true);
  });

  it('handle notifications tab content', () => {
    const wrapper = subject();
    wrapper.find('.sidekick__tabs-notifications').simulate('click');

    expect(wrapper.find('.sidekick__tab-content--notifications').exists()).toBe(true);
  });

  it('renders total unread messages', () => {
    const wrapper = subject({ countAllUnreadMessages: 10 });

    expect(wrapper.find('.sidekick__tab-notifications--unread-messages').exists()).toBe(true);
  });
});
