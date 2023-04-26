import React from 'react';

import { shallow } from 'enzyme';

import { CreateEmailAccount, Properties } from '.';
import { passwordStrength } from '../../lib/password';

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
    wrapper.find('PasswordInput').simulate('change', 'abcd9876');
    wrapper.find('Button').simulate('press');

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

    expect(wrapper.find('PasswordInput').prop('alert')).toEqual({ variant: 'error', text: 'invalid' });
  });

  it('renders general errors', function () {
    const wrapper = subject({ errors: { general: 'invalid' } });

    expect(wrapper.find('Alert').prop('children')).toEqual('invalid');
  });

  it('updates the password strength when passwords are entered', function () {
    const wrapper = subject({ errors: { general: 'invalid' } });

    const password = 'aA1!bbcddd';
    const expectedStrength = passwordStrength(password);
    wrapper.find('PasswordInput').simulate('change', password);

    expect(wrapper.find('PasswordStrength').prop('strength')).toEqual(expectedStrength);
  });
});
