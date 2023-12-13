import React from 'react';
import { shallow } from 'enzyme';
import { Properties, RewardsContainer } from '.';
import { RewardsFAQModal } from '../rewards-faq-modal';
import { RewardsPopupContainer } from '../rewards-popup/container';
import { RewardsButton } from '../rewards-button';

describe('rewards-container', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isFirstTimeLogin: false,
      meowPreviousDay: '',
      isRewardsLoading: false,
      showRewardsInTooltip: false,
      showRewardsInPopup: false,
      hasLoadedConversation: false,
      onRewardsPopupClose: () => {},
      onRewardsTooltipClose: () => {},
      ...props,
    };

    return shallow(<RewardsContainer {...allProps} />);
  };

  it('renders the RewardsButton component', function () {
    const wrapper = subject();
    expect(wrapper.find(RewardsButton)).toHaveLength(1);
  });

  it('opens/closes the RewardsPopupContainer based on state', async function () {
    const wrapper = subject();

    expect(wrapper).not.toHaveElement(RewardsPopupContainer);

    wrapper.setState({ isRewardsPopupOpen: true });
    expect(wrapper).toHaveElement(RewardsPopupContainer);

    wrapper.setState({ isRewardsPopupOpen: false });
    expect(wrapper).not.toHaveElement(RewardsPopupContainer);
  });

  it('renders the RewardsPopupContainer immediately if first time login and conversation is loaded', async function () {
    const wrapper = subject({ isFirstTimeLogin: true, hasLoadedConversation: true });
    expect(wrapper).toHaveElement(RewardsPopupContainer);
  });

  it('does not render the RewardsPopupContainer on first time login if conversation is not loaded', async function () {
    const wrapper = subject({ isFirstTimeLogin: true, hasLoadedConversation: false });
    expect(wrapper).not.toHaveElement(RewardsPopupContainer);
  });

  it('does not render the RewardsPopupContainer if not first time login and conversation is loaded', async function () {
    const wrapper = subject({ isFirstTimeLogin: false, hasLoadedConversation: true });
    expect(wrapper).not.toHaveElement(RewardsPopupContainer);
  });

  it('renders RewardsFAQModal when isRewardsFAQModalOpen is true', function () {
    const wrapper = subject();
    wrapper.setState({ isRewardsFAQModalOpen: true });
    expect(wrapper.find(RewardsFAQModal)).toHaveLength(1);
  });

  it('does not render RewardsFAQModal when isRewardsFAQModalOpen is false', function () {
    const wrapper = subject();
    expect(wrapper.find(RewardsFAQModal)).toHaveLength(0);
  });
});
