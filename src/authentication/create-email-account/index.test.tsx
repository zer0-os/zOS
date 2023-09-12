import React from 'react';

import { shallow } from 'enzyme';

import { CreateEmailAccount, Properties } from '.';
import { inputEvent } from '../../test/utils';

describe('CreateEmailAccount', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
      onNext: () => null,
      ...props,
    };

    return shallow(<CreateEmailAccount {...allProps} />);
  };

  it('publishes form data when Next is clicked', function () {
    const onNext = jest.fn();
    const wrapper = subject({ onNext });

    wrapper.find('Input[name="email"]').simulate('change', 'jack@example.com');
    wrapper.find('PasswordInput[name="password"]').simulate('change', 'abcd9876');
    wrapper.find('form').simulate('submit', inputEvent());

    expect(onNext).toHaveBeenCalledWith({ email: 'jack@example.com', password: 'abcd9876' });
  });

  it('sets button to loading', function () {
    const wrapper = subject({ isLoading: true });
    expect(wrapper.find('Button').prop('isLoading')).toEqual(true);

    wrapper.setProps({ isLoading: false });
    expect(wrapper.find('Button').prop('isLoading')).toEqual(false);
  });

  it('renders email errors', function () {
    const wrapper = subject({ errors: { email: 'invalid' } });

    expect(wrapper.find('Input[name="email"]').prop('alert')).toEqual({ variant: 'error', text: 'invalid' });
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

    wrapper.find('Input[name="email"]').simulate('change', 'jack@example.com');
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
});
