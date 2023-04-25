import React from 'react';

import { shallow } from 'enzyme';

import { Invite, Properties } from '.';
import { InviteCodeStatus } from '../../store/registration';

describe('Invite', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      inviteStatus: '',
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
    wrapper.find('Input').simulate('change', '  ');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input').simulate('change', '1');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input').simulate('change', '456721');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(false);
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
    wrapper.find('Button').simulate('press');

    wrapper.setProps({ isLoading: false });
    expect(validateInvite).toHaveBeenCalledWith({ code });
  });

  it('shows alert if invite is not valid', function () {
    const wrapper = subject({});

    wrapper.find('Button').simulate('press');

    wrapper.setProps({ inviteStatus: InviteCodeStatus.INVITE_CODE_USED });
    expect(wrapper.find('Alert').prop('children')).toEqual(
      'This invite code has already been redeemed. If you cannot get another invite you can join the waitlist below.'
    );

    wrapper.setProps({ inviteStatus: InviteCodeStatus.INVITE_CODE_NOT_FOUND });
    expect(wrapper.find('Alert').prop('children')).toEqual('Invite code not found. Please check your invite message.');
  });
});
