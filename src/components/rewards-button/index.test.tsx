import React from 'react';
import { shallow } from 'enzyme';
import { Properties, RewardsButton } from '.';
import { TooltipPopup } from '../tooltip-popup/tooltip-popup';

describe('rewards-button', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isFirstTimeLogin: false,
      meowPreviousDay: '',
      isRewardsLoading: false,
      showRewardsInTooltip: false,
      showRewardsInPopup: false,
      hasLoadedConversation: false,
      isRewardsPopupOpen: false,
      closeRewardsTooltip: () => {},
      openRewards: () => {},
      ...props,
    };

    return shallow(<RewardsButton {...allProps} />);
  };

  it('calls openRewards when the button is clicked', function () {
    const openRewards = jest.fn();
    const wrapper = subject({ openRewards });
    wrapper.find('.rewards-button-container__rewards-button').simulate('click');
    expect(openRewards).toHaveBeenCalled();
  });

  it('rewards tooltip popup is not rendered if messenger not fullscreen', function () {
    const wrapper = subject({ meowPreviousDay: '9000000000000000000' });
    const tooltipPopup = wrapper.find(TooltipPopup);
    expect(tooltipPopup.prop('open')).toBe(false);
  });

  it('rewards tooltip popup is not rendered if first time log in', function () {
    const wrapper = subject({
      meowPreviousDay: '9000000000000000000',
      isRewardsLoading: false,
      isFirstTimeLogin: true,
    });
    const tooltipPopup = wrapper.find(TooltipPopup);
    expect(tooltipPopup.prop('open')).toBe(false);
  });

  it('rewards tooltip popup is rendered upon load', function () {
    const wrapper = subject({
      meowPreviousDay: '9000000000000000000',
      isRewardsLoading: false,
      showRewardsInTooltip: true,
    });

    expect(wrapper.find(TooltipPopup).prop('open')).toBe(true);
    expect(wrapper.find(TooltipPopup).prop('content')).toEqual('You’ve earned 9 MEOW today');
  });

  it('calls closeRewardsTooltip if TooltipPopup is closed', function () {
    const closeRewardsTooltip = jest.fn();
    const wrapper = subject({
      meowPreviousDay: '1000000000000000000',
      isRewardsLoading: false,
      showRewardsInTooltip: true,
      closeRewardsTooltip,
    });
    expect(wrapper.find(TooltipPopup).prop('open')).toBe(true);

    wrapper.find(TooltipPopup).simulate('close');
    expect(closeRewardsTooltip).toHaveBeenCalled();
  });

  it('displays rewards icon status when conditions are met', function () {
    const wrapper = subject({
      showRewardsInPopup: true,
      isRewardsPopupOpen: false,
    });

    expect(wrapper.find('.rewards-button-container__rewards-icon__status')).toHaveLength(1);
  });

  it('does not display rewards icon status when rewards popup is open', function () {
    const wrapper = subject({
      showRewardsInPopup: true,
      isRewardsPopupOpen: true,
    });

    expect(wrapper.find('.rewards-button-container__rewards-icon__status')).toHaveLength(0);
  });

  it('does not display rewards icon status when showRewardsInPopup is false', function () {
    const wrapper = subject({
      showRewardsInPopup: false,
      isRewardsPopupOpen: false,
    });

    expect(wrapper.find('.rewards-button-container__rewards-icon__status')).toHaveLength(0);
  });

  it('does not display rewards icon status when messenger is not in full screen', function () {
    const wrapper = subject({
      showRewardsInPopup: true,
      isRewardsPopupOpen: false,
    });

    expect(wrapper.find('.rewards-button-container__rewards-icon__status')).toHaveLength(0);
  });
});
