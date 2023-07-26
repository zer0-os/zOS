import React from 'react';
import { shallow } from 'enzyme';
import { Properties, RewardsBar } from '.';
import { RewardsPopupContainer } from '../rewards-popup/container';
import { TooltipPopup } from '../tooltip-popup/tooltip-popup';

describe('rewards-bar', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isFirstTimeLogin: false,
      includeRewardsAvatar: false,
      isMessengerFullScreen: false,
      userName: '',
      userHandle: '',
      userAvatarUrl: '',
      zeroPreviousDay: '',
      isRewardsLoading: false,
      showNewRewards: false,
      onRewardsPopupClose: () => {},
      onLogout: () => {},
      ...props,
    };

    return shallow(<RewardsBar {...allProps} />);
  };

  it('opens/closes the rewards popup', async function () {
    const wrapper = subject({});

    expect(wrapper).not.toHaveElement(RewardsPopupContainer);

    wrapper.find('.rewards-bar__rewards-button').simulate('click');
    expect(wrapper).toHaveElement(RewardsPopupContainer);

    wrapper.find(RewardsPopupContainer).simulate('close');
    expect(wrapper).not.toHaveElement(RewardsPopupContainer);
  });

  it('rewards popup is rendered immediately if first time login', async function () {
    const wrapper = subject({ isFirstTimeLogin: true });

    expect(wrapper).toHaveElement(RewardsPopupContainer);
  });

  it('rewards tooltip popup is not rendered if messenger not fullscreen', async function () {
    const wrapper = subject({ zeroPreviousDay: '9000000000000000000' });
    expect(wrapper).not.toHaveElement(TooltipPopup);
  });

  it('rewards tooltip popup is not rendered if first time log in', async function () {
    const wrapper = subject({
      zeroPreviousDay: '9000000000000000000',
      isRewardsLoading: false,
      isFirstTimeLogin: true,
    });
    expect(wrapper).not.toHaveElement(TooltipPopup);
  });

  it('does not render rewards tooltip popup if not in full screen', async function () {
    const wrapper = subject({
      zeroPreviousDay: '9000000000000000000',
      isRewardsLoading: false,
      showNewRewards: true,
      isMessengerFullScreen: false,
    });
    expect(wrapper).not.toHaveElement(TooltipPopup);
  });

  it('rewards tooltip popup is rendered upon load', async function () {
    const wrapper = subject({
      zeroPreviousDay: '9000000000000000000',
      isRewardsLoading: false,
      showNewRewards: true,
      isMessengerFullScreen: true,
    });

    expect(wrapper.find(TooltipPopup).prop('open')).toBeTrue();
    expect(wrapper.find(TooltipPopup).prop('content')).toEqual('You’ve earned 9 ZERO today');
    expect(wrapper.state()['isRewardsTooltipOpen']).toBeTrue();
  });

  it('closes rewards tooltip popup if clicked on close icon', async function () {
    const wrapper = subject({
      zeroPreviousDay: '1000000000000000000',
      isRewardsLoading: false,
      showNewRewards: true,
      isMessengerFullScreen: true,
    });
    expect(wrapper.find(TooltipPopup).prop('open')).toBeTrue();

    wrapper.find(TooltipPopup).simulate('close');
    expect(wrapper.find(TooltipPopup).prop('open')).toBeFalse();
  });

  it('displays rewards icon status when conditions are met', function () {
    const wrapper = subject({
      showNewRewards: true,
      isMessengerFullScreen: true,
    });

    wrapper.find('.rewards-bar__rewards-button').simulate('click');
    wrapper.find(RewardsPopupContainer).simulate('close');

    expect(wrapper.find('.rewards-bar__rewards-icon__status')).toHaveLength(1);
  });

  it('does not display rewards icon status when rewards pop up is open', function () {
    const wrapper = subject({
      showNewRewards: true,
      isMessengerFullScreen: true,
    });

    wrapper.find('.rewards-bar__rewards-button').simulate('click');

    expect(wrapper.find('.rewards-bar__rewards-icon__status')).toHaveLength(0);
  });

  it('renders the SettingsMenu as necessary', function () {
    let wrapper = subject({ includeRewardsAvatar: true });
    expect(wrapper).toHaveElement('SettingsMenu');

    wrapper.setProps({ includeRewardsAvatar: false });
    expect(wrapper).not.toHaveElement('SettingsMenu');
  });
});
