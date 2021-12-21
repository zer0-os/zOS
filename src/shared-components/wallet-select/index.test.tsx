import React from 'react';
import { shallow } from 'enzyme';

import { WalletSelect } from '.';

describe('WalletSelect', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<WalletSelect {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'taco-launcher' });

    expect(wrapper.hasClass('taco-launcher')).toBe(true);
  });
});
