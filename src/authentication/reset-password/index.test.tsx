import React from 'react';

import { shallow } from 'enzyme';

import { Properties, ResetPassword } from '.';
import { inputEvent } from '../../test/utils';

describe('ResetPassword', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
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
});
