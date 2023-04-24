import React from 'react';

import { shallow } from 'enzyme';

import { CreateEmailAccount, Properties } from '.';

describe('CreateEmailAccount', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
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

  it('disables button if any field is empty', function () {
    const wrapper = subject({});

    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input[name="email"]').simulate('change', 'jack@example.com');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input[name="email"]').simulate('change', '   ');
    wrapper.find('PasswordInput').simulate('change', 'abcd9876');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(true);

    wrapper.find('Input[name="email"]').simulate('change', 'jack@example.com');
    wrapper.find('PasswordInput').simulate('change', 'abcd9876');
    expect(wrapper.find('Button').prop('isDisabled')).toEqual(false);
  });

  it('sets button to loading', function () {
    const wrapper = subject({ isLoading: true });
    expect(wrapper.find('Button').prop('isLoading')).toEqual(true);

    wrapper.setProps({ isLoading: false });
    expect(wrapper.find('Button').prop('isLoading')).toEqual(false);
  });
});
