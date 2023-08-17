import React from 'react';

import { shallow } from 'enzyme';

import { ConfirmPasswordReset, Properties } from '.';
import { inputEvent } from '../../test/utils';
import { ConfirmPasswordResetStage } from '../../store/confirm-password-reset';

describe('ConfirmPasswordReset', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      stage: ConfirmPasswordResetStage.SubmitNewPassword,
      isLoading: false,
      errors: {},
      onSubmit: () => null,
      ...props,
    };

    return shallow(<ConfirmPasswordReset {...allProps} />);
  };

  it('publishes form data when submit button is clicked', function () {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });

    wrapper.find('PasswordInput[name="password"]').simulate('change', 'abcd9876');
    wrapper.find('form').simulate('submit', inputEvent());

    expect(onSubmit).toHaveBeenCalledWith({ password: 'abcd9876' });
  });

  it('sets button to loading', function () {
    const wrapper = subject({ isLoading: true });
    expect(wrapper.find('Button').prop('isLoading')).toEqual(true);

    wrapper.setProps({ isLoading: false });
    expect(wrapper.find('Button').prop('isLoading')).toEqual(false);
  });

  it('renders password errors', function () {
    const wrapper = subject({ errors: { password: 'invalid' } });

    expect(wrapper.find('PasswordInput[name="password"]').prop('alert')).toEqual({ variant: 'error', text: 'invalid' });
  });

  it('renders general errors', function () {
    const wrapper = subject({ errors: { general: 'invalid' } });

    expect(wrapper.find('Alert').prop('children')).toEqual('invalid');
  });

  it('renders confirm password field', function () {
    const wrapper = subject({});

    expect(wrapper.find('PasswordInput[name="confirmPassword"]').exists()).toEqual(true);
  });

  it('shows success/error alert if passwords match or do not match', function () {
    const wrapper = subject({});

    wrapper.find('PasswordInput[name="password"]').simulate('change', 'abcd9876');

    // Passwords match
    wrapper.find('PasswordInput[name="confirmPassword"]').simulate('change', 'abcd9876');
    expect(wrapper.find('PasswordInput[name="confirmPassword"]').prop('alert')).toEqual({
      variant: 'success',
      text: 'Passwords match',
    });

    // Passwords do not match
    wrapper.find('PasswordInput[name="confirmPassword"]').simulate('change', 'abcd9877');
    expect(wrapper.find('PasswordInput[name="confirmPassword"]').prop('alert')).toEqual({
      variant: 'error',
      text: 'Passwords do not match',
    });
  });

  it('renders success message when stage is equal to "Done" ', function () {
    const wrapper = subject({});
    wrapper.find('PasswordInput[name="password"]').simulate('change', 'abcd9876');
    wrapper.find('PasswordInput[name="confirmPassword"]').simulate('change', 'abcd9876');
    wrapper.find('form').simulate('submit', { preventDefault: jest.fn() });

    wrapper.setProps({ stage: ConfirmPasswordResetStage.Done });

    expect(wrapper.find('.confirm-password-reset__success-message').text()).toContain(
      'Password reset successful. You can now Log in with your new password.'
    );
  });
});
