import React from 'react';

import { shallow } from 'enzyme';

import { Properties, ResetPassword } from '.';
import { inputEvent } from '../../test/utils';

describe('ResetPassword', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
      emailSubmitted: false,
      onSubmit: () => null,
      ...props,
    };

    return shallow(<ResetPassword {...allProps} />);
  };

  it('calls on submit when submit button is clicked', function () {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });

    wrapper.find('Input[name="email"]').simulate('change', 'jack@example.com');
    wrapper.find('form').simulate('submit', inputEvent());

    expect(onSubmit).toHaveBeenCalledWith({ email: 'jack@example.com' });
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

  it('renders general errors', function () {
    const wrapper = subject({ errors: { general: 'invalid' } });

    expect(wrapper.find('Alert').prop('children')).toEqual('invalid');
  });

  it('renders success message when email submitted', function () {
    const wrapper = subject({ emailSubmitted: true });
    wrapper.setState({ email: 'test@example.com' });
    expect(wrapper.find('.reset-password__success-message').text()).toContain(
      'An email containing a reset password link has been emailed to: test@example.com'
    );
  });

  it('disables the submit button if isLoading or email is empty', function () {
    let wrapper = subject({ isLoading: true });
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper = subject({});
    wrapper.setState({ email: '' });
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);
  });

  it('tracks email input correctly', function () {
    const wrapper = subject({});
    wrapper.find('Input[name="email"]').simulate('change', 'jack@example.com');
    expect(wrapper.state('email')).toEqual('jack@example.com');
  });
});
