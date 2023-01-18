import React from 'react';
import { shallow } from 'enzyme';

import { Container } from '.';
import { IfAuthenticated } from '../authentication/if-authenticated';

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
});
