import React from 'react';

import { shallow } from 'enzyme';
import { Button } from './button';

describe('Button', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<Button {...allProps} />);
  };

  it('setWalletModalOpen on openModal on click', () => {
    const setWalletModalOpen = jest.fn();

    const wrapper = subject({ setWalletModalOpen });

    wrapper.simulate('click');

    expect(setWalletModalOpen).toHaveBeenCalledWith(true);
  });
});
