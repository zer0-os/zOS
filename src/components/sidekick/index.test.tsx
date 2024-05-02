import React from 'react';
import { shallow } from 'enzyme';

import { Container, Properties, SidekickVariant } from '.';
import { MessengerList } from '../messenger/list';
import { Stage as GroupManagementStage } from '../../store/group-management';

describe('Sidekick', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      className: '',
      variant: SidekickVariant.Primary,
      groupManagementStage: GroupManagementStage.None,
      isSecondarySidekickOpen: false,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders sidekick state when closed', () => {
    const wrapper = subject({});

    const sidekick = wrapper.find('.sidekick');

    expect(sidekick.hasClass('sidekick--open')).toBe(false);
  });

  it('render messages tab content', () => {
    const wrapper = subject();

    expect(wrapper.find(MessengerList).exists()).toBe(true);
    expect(wrapper.find('.sidekick__tab-content--messages').exists()).toBe(true);
  });
});
