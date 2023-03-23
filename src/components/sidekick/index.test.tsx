import React from 'react';
import { shallow } from 'enzyme';

import { Container, Properties } from '.';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { MessengerList } from '../messenger/list';

describe('Sidekick', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      className: '',
      isOpen: false,
      closeConversations: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

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

  it('closes conversations when list publishes close event', () => {
    const closeConversations = jest.fn();

    const wrapper = subject({ closeConversations });

    wrapper.find(MessengerList).simulate('close');

    expect(closeConversations).toHaveBeenCalledOnce();
  });
});
