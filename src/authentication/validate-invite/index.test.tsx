import React from 'react';

import { shallow } from 'enzyme';

import { Invite, Properties } from '.';
import { InviteCodeStatus } from '../../store/registration';
import { inputEvent } from '../../test/utils';

describe('Invite', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      inviteCodeStatus: '',
      validateInvite: () => null,
      ...props,
    };

    return shallow(<Invite {...allProps} />);
  };

  it('enables button if input length valid, disables otherwise', function () {
    const wrapper = subject({});

    // disabled by default
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input').simulate('change', '123456');

    // enabled after adding valid input
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(false);

    // invalid codes
    wrapper.find('Input').simulate('change', '');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input').simulate('change', '12341231231231321345');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input').simulate('change', 'acieufbwiefub1o2noeubcwoeufb');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);
  });

  it('sets button to loading', function () {
    const wrapper = subject({ isLoading: true });
    expect(wrapper.find('Button').prop('isLoading')).toEqual(true);

    wrapper.setProps({ isLoading: false });
    expect(wrapper.find('Button').prop('isLoading')).toEqual(false);
  });

  it('calls validateInvite prop after setting code', function () {
    const validateInvite = jest.fn();
    const code = '456721';
    const wrapper = subject({ validateInvite });

    wrapper.find('Input').simulate('change', code);
    wrapper.find('form').simulate('submit', inputEvent());

    wrapper.setProps({ isLoading: false });
    expect(validateInvite).toHaveBeenCalledWith({ code });
  });

  it('shows alert if invite is not valid', function () {
    const wrapper = subject({});

    wrapper.find('form').simulate('submit', inputEvent());

    wrapper.setProps({ inviteCodeStatus: InviteCodeStatus.INVITE_CODE_USED });
    expect(wrapper.find('Alert').prop('children')).toEqual(
      'This invite code has already been redeemed. If you cannot get another invite you can join the waitlist below.'
    );

    wrapper.setProps({ inviteCodeStatus: InviteCodeStatus.INVITE_CODE_NOT_FOUND });
    expect(wrapper.find('Alert').prop('children')).toEqual('Invite code not found. Please check your invite message.');

    wrapper.setProps({ inviteCodeStatus: InviteCodeStatus.INVITE_CODE_MAX_USES });
    expect(wrapper.find('Alert').prop('children')).toEqual(
      'This invite has been used too many times. Please use a new invite code.'
    );
  });

  it('disables the button after error until code is edited', function () {
    const validateInvite = jest.fn();
    const code = '123456';
    const wrapper = subject({ validateInvite });

    wrapper.find('Input').simulate('change', code);
    wrapper.find('form').simulate('submit', inputEvent());

    wrapper.setProps({ inviteCodeStatus: InviteCodeStatus.INVITE_CODE_USED });
    expect(wrapper.find('Alert').prop('children')).toEqual(
      'This invite code has already been redeemed. If you cannot get another invite you can join the waitlist below.'
    );

    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input').simulate('change', '123457');

    expect(wrapper.find('Button').prop('isDisabled')).toEqual(false);
  });

  it('trims input', function () {
    const validateInvite = jest.fn();
    const code = '  123456  ';
    const wrapper = subject({ validateInvite });

    wrapper.find('Input').simulate('change', code);
    wrapper.find('form').simulate('submit', inputEvent());

    expect(validateInvite).toHaveBeenCalledWith({ code: '123456' });
  });
});
