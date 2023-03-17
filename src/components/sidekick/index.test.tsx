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

  it('renders sidekick state when open', () => {
    const wrapper = subject({ isOpen: true });

    const sidekick = wrapper.find('.sidekick');

    expect(sidekick.hasClass('sidekick--open')).toBe(true);
  });

  it('renders sidekick state when closed', () => {
    const wrapper = subject({ isOpen: false });

    const sidekick = wrapper.find('.sidekick');

    expect(sidekick.hasClass('sidekick--open')).toBe(false);
  });

  it('render messages tab content', () => {
    const wrapper = subject();

    expect(wrapper.find(MessengerList).exists()).toBe(true);
    expect(wrapper.find('.sidekick__tab-content--messages').exists()).toBe(true);
  });
});
