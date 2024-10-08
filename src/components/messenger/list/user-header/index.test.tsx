import { shallow } from 'enzyme';
import { Properties, UserHeader } from '.';
import { IconButton } from '@zero-tech/zui/components';
import { Button } from '@zero-tech/zui/components/Button';

import { bem } from '../../../../lib/bem';
import { RewardsToolTipContainer } from '../rewards-tooltip/container';
const c = bem('.user-header');

describe(UserHeader, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      userName: '',
      userHandle: '',
      userAvatarUrl: '',
      userIsOnline: true,
      showRewardsTooltip: false,
      hasUnviewedRewards: false,
      isCollapsed: false,

      onToggleExpand: () => null,
      onLogout: () => null,
      onVerifyId: () => null,
      startConversation: () => null,
      openUserProfile: () => null,
      totalRewardsViewed: () => null,
      ...props,
    };

    return shallow(<UserHeader {...allProps} />);
  };

  it('renders userHandle when user handle is not empty', function () {
    const wrapper = subject({ userHandle: '0://zid.example' });
    expect(wrapper).toHaveElement(c('handle'));
  });

  it('does not render userHandle when user handle is empty', function () {
    const wrapper = subject({ userHandle: '' });
    expect(wrapper).not.toHaveElement(c('handle'));
  });

  it('renders IconButton', function () {
    const wrapper = subject();
    expect(wrapper).toHaveElement(IconButton);
  });

  it('calls startConversation when IconButton is clicked', function () {
    const startConversationMock = jest.fn();
    const wrapper = subject({ startConversation: startConversationMock });

    const buttons = wrapper.find(IconButton);

    buttons.at(1).simulate('click');
    expect(startConversationMock).toHaveBeenCalled();
  });

  it('renders verify id button when user handle is a wallet address', function () {
    const wrapper = subject({ userHandle: '0x1234567890abcdef' });
    expect(wrapper).toHaveElement(Button);
  });

  it('does not verify id button when user handle is not a wallet address', function () {
    const wrapper = subject({ userHandle: 'user123' });
    expect(wrapper).not.toHaveElement(Button);
  });

  it('onVerifyId', function () {
    const onVerifyIdMock = jest.fn();

    subject({ userHandle: '0x1234567890abcdef', onVerifyId: onVerifyIdMock }).find(Button).simulate('press');

    expect(onVerifyIdMock).toHaveBeenCalled();
  });

  it('renders rewards tooltip when showRewardsTooltip is true', function () {
    const wrapper = subject({ showRewardsTooltip: true });
    expect(wrapper).toHaveElement(RewardsToolTipContainer);
  });

  it('does not render rewards tooltip when showRewardsTooltip is false', function () {
    const wrapper = subject({ showRewardsTooltip: false });
    expect(wrapper).not.toHaveElement(RewardsToolTipContainer);
  });

  it('fires openUserProfile when user avatar is clicked', function () {
    const openUserProfile = jest.fn();
    const wrapper = subject({ openUserProfile });

    wrapper.find(c('avatar-container')).simulate('click');

    expect(openUserProfile).toHaveBeenCalled();
  });

  it('fires totalRewardsViewed when user avatar is clicked', function () {
    const totalRewardsViewed = jest.fn();
    const wrapper = subject({ totalRewardsViewed });

    wrapper.find(c('avatar-container')).simulate('click');

    expect(totalRewardsViewed).toHaveBeenCalled();
  });
});
