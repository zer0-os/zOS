import React from 'react';
import { shallow } from 'enzyme';

import { Container, Properties, SidekickVariant } from '.';
import { MessengerList } from '../messenger/list';
import { Stage as GroupManagementStage } from '../../store/group-management';
import { UserProfileContainer } from '../messenger/user-profile/container';
import { GroupManagementContainer } from '../messenger/group-management/container';
import { Stage as ProfileStage } from '../../store/user-profile';
import { Stage as MessageInfoStage } from '../../store/message-info';
import { MessageInfoContainer } from '../messenger/message-info/container';

jest.mock('../../lib/web3/thirdweb/client', () => ({
  getThirdWebClient: jest.fn(),
  getChain: jest.fn(() => ({
    blockExplorers: [{ url: 'https://sepolia.etherscan.io' }],
  })),
}));

describe('Sidekick', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      className: '',
      variant: SidekickVariant.Primary,
      groupManagementStage: GroupManagementStage.None,
      isSecondarySidekickOpen: false,
      profileStage: ProfileStage.None,
      messageInfoStage: MessageInfoStage.None,

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

  it('renders UserProfileContainer when profile stage is not None', () => {
    const wrapper = subject({ profileStage: ProfileStage.Overview });

    expect(wrapper.find(UserProfileContainer)).toExist();
    expect(wrapper.find(MessengerList)).not.toExist();
  });

  it('renders GroupManagementContainer when variant is secondary', () => {
    const wrapper = subject({ variant: SidekickVariant.Secondary });

    expect(wrapper.find(GroupManagementContainer)).toExist();
    expect(wrapper.find(MessengerList)).not.toExist();
    expect(wrapper.find(UserProfileContainer)).not.toExist();
  });

  it('renders MessageInfoContainer when variant is secondary, message info stage is not None and group stage is None', () => {
    const wrapper = subject({
      variant: SidekickVariant.Secondary,
      messageInfoStage: MessageInfoStage.Overview,
      groupManagementStage: GroupManagementStage.None,
    });

    expect(wrapper.find(MessageInfoContainer)).toExist();
    expect(wrapper.find(GroupManagementContainer)).not.toExist();
    expect(wrapper.find(MessengerList)).not.toExist();
    expect(wrapper.find(UserProfileContainer)).not.toExist();
  });
});
