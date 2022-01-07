import React from 'react';
import { shallow } from 'enzyme';

import { EthAddress } from '.';

describe('EthAddress', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      address: '',
      ...props,
    };

    return shallow(<EthAddress {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'taco-launcher' });

    expect(wrapper.find('.eth-address').hasClass('taco-launcher')).toBe(true);
  });

  it('it displays truncated wallet address', () => {
    const address = '0x0D1C97113D70E4D04345D55807CB19C648E17FBA';

    const wrapper = subject({ address });

    expect(wrapper.find('.eth-address__address').text().trim()).toBe('0x0D1C...7FBA');
  });

  it('it adds full address as title', () => {
    const address = '0x0D1C97113D70E4D04345D55807CB19C648E17FBA';

    const wrapper = subject({ address });

    expect(wrapper.find('.eth-address__address').prop('title')).toBe(address);
  });
});
