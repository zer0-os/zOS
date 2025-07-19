import React from 'react';

import { shallow } from 'enzyme';

import { EmailLogin, Properties } from '.';
import { inputEvent } from '../../test/utils';

describe('EmailLogin', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
      onSubmit: () => null,
      switchLoginStage: () => null,
      ...props,
    };

    return shallow(<EmailLogin {...allProps} />);
  };

  it('publishes form data when form is submitted', function () {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });

    wrapper.find('Input[name="email"]').simulate('change', 'jack@example.com');
    wrapper.find('PasswordInput').simulate('change', 'abcd9876');
    wrapper.find('form').simulate('submit', inputEvent());

    expect(onSubmit).toHaveBeenCalledWith({ email: 'jack@example.com', password: 'abcd9876' });
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

    expect(wrapper.find('PasswordInput').prop('alert')).toEqual({ variant: 'error', text: 'invalid' });
  });

  it('renders general errors', function () {
    const wrapper = subject({ errors: { general: 'invalid' } });

    expect(wrapper.find('Alert').prop('children')).toEqual('invalid');
  });
});
