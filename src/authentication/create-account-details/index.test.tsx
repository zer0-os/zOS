import React from 'react';

import { shallow } from 'enzyme';

import { CreateAccountDetails, Properties } from '.';

describe('CreateAccountDetails', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
      onCreate: () => null,
      ...props,
    };

    return shallow(<CreateAccountDetails {...allProps} />);
  };

  it('publishes form data when Create Account is clicked', function () {
    const onCreate = jest.fn();
    const wrapper = subject({ onCreate });

    wrapper.find('Input[name="name"]').simulate('change', 'Jack Black');
    wrapper.find('Button').simulate('press');

    expect(onCreate).toHaveBeenCalledWith({ name: 'Jack Black' });
  });

  it('disables button if name is empty', function () {
    const wrapper = subject({});

    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input[name="name"]').simulate('change', '   ');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input[name="name"]').simulate('change', 'Jack Black');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(false);
  });

  it('sets button to loading', function () {
    const wrapper = subject({ isLoading: true });
    expect(wrapper.find('Button').prop('isLoading')).toEqual(true);

    wrapper.setProps({ isLoading: false });
    expect(wrapper.find('Button').prop('isLoading')).toEqual(false);
  });

  it('renders name errors', function () {
    const wrapper = subject({ errors: { name: 'invalid' } });

    expect(wrapper.find('Input[name="name"]').prop('alert')).toEqual({ variant: 'error', text: 'invalid' });
  });

  it('renders general errors', function () {
    const wrapper = subject({ errors: { general: 'invalid' } });

    expect(wrapper.find('Alert').prop('children')).toEqual('invalid');
  });
});
