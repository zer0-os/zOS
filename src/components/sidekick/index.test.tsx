import React from 'react';
import { shallow } from 'enzyme';

import { Container } from '.';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { DirectMessageMembers } from '../../platform-apps/channels/direct-message-members';

describe('Sidekick', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      className: '',
      updateLayout: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'todo' });

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    expect(ifAuthenticated.find('.todo').exists()).toBe(true);
  });

  it('renders sidekick panel', () => {
    const wrapper = subject();

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    expect(ifAuthenticated.find('.app-sidekick-panel__target').exists()).toBe(true);
  });

  it('renders sidekick when panel tab is clicked', () => {
    const updateLayout = jest.fn();
    const wrapper = subject(updateLayout);

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });
    ifAuthenticated.find('.app-sidekick-panel__target').simulate('click');

    expect(ifAuthenticated.find('.sidekick__slide-out').exists()).toBe(false);
  });

  it('renders default active tab', () => {
    const wrapper = subject();

    expect(wrapper.find(DirectMessageMembers).exists()).toBe(true);
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
    const wrapper = subject({ allUnreadMessages: 10 });

    expect(wrapper.find('.sidekick__tab-notifications--unread-messages').exists()).toBe(true);
  });
});
