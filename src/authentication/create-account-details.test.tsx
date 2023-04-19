import React from 'react';

import { shallow } from 'enzyme';

import { CreateAccountDetails, Properties } from './create-account-details';

describe('CreateAccountDetails', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
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
});
