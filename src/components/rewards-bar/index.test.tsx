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
      userAvatarUrl: '',
      zero: '',
      zeroPreviousDay: '',
      isRewardsLoading: false,
      onRewardsPopupClose: () => {},
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

  it('parses token number to renderable string', function () {
    const wrapper = subject({ zero: '9123456789111315168' });
    wrapper.find('.rewards-bar__rewards-button').simulate('click');
    expect(wrapper.find(RewardsPopupContainer).prop('zero')).toEqual('9.1234');

    wrapper.setProps({ zero: '9123000000000000000' });
    expect(wrapper.find(RewardsPopupContainer).prop('zero')).toEqual('9.123');

    wrapper.setProps({ zero: '23456789111315168' });
    expect(wrapper.find(RewardsPopupContainer).prop('zero')).toEqual('0.0234');

    wrapper.setProps({ zero: '0' });
    expect(wrapper.find(RewardsPopupContainer).prop('zero')).toEqual('0');
  });

  it('rewards tooltip popup is not rendered if messenger not fullscreen', async function () {
    const wrapper = subject({ zeroPreviousDay: '9000000000000000000', isMessengerFullScreen: false });
    expect(wrapper).not.toHaveElement(TooltipPopup);
  });

  it('rewards tooltip popup is not rendered if first time log in', async function () {
    const wrapper = subject({
      zeroPreviousDay: '9000000000000000000',
      isMessengerFullScreen: false,
      isRewardsLoading: false,
      isFirstTimeLogin: true,
    });
    expect(wrapper).not.toHaveElement(TooltipPopup);
  });

  it('rewards tooltip popup is rendered upon load', async function () {
    const wrapper = subject({
      zeroPreviousDay: '9000000000000000000',
      isRewardsLoading: false,
      isMessengerFullScreen: true,
    });

    expect(wrapper.find(TooltipPopup).prop('open')).toBeTrue();
    expect(wrapper.find(TooltipPopup).prop('content')).toEqual('You’ve earned 9 ZERO today');
    expect(wrapper.state()['isRewardsTooltipOpen']).toBeTrue();
  });

  it('closes rewards tooltip popup if clicked on close icon', async function () {
    const wrapper = subject({
      zero: '9000000000000000000',
      zeroPreviousDay: '1000000000000000000',
      isRewardsLoading: false,
      isMessengerFullScreen: true,
    });
    expect(wrapper.find(TooltipPopup).prop('open')).toBeTrue();

    wrapper.find(TooltipPopup).simulate('close');
    expect(wrapper.find(TooltipPopup).prop('open')).toBeFalse();
  });

  it('renders the rewards avatar as necessary', function () {
    let wrapper = subject({ includeRewardsAvatar: true });
    expect(wrapper).toHaveElement('Avatar');

    wrapper.setProps({ includeRewardsAvatar: false });
    expect(wrapper).not.toHaveElement('Avatar');
  });
});
