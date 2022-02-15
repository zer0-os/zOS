import React from 'react';
import { shallow } from 'enzyme';

import { AddressBar } from '.';

describe('AddressBar', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      route: '',
      ...props,
    };

    return shallow(<AddressBar {...allProps} />);
  };

  it('renders protocol', () => {
    const wrapper = subject({ route: 'food.street.tacos' });
    
    expect(wrapper.find('.address-bar__protocol').text().trim()).toStrictEqual('0://');
  });

  it('renders route in segments', () => {
    const wrapper = subject({ route: 'food.street.tacos' });
    
    const segments = wrapper.find('.address-bar__route-segment').map(segment => segment.text().trim());

    expect(segments).toStrictEqual(['food', 'street', 'tacos']);
  });

  it('renders route seperators', () => {
    const wrapper = subject({ route: 'food.street.tacos' });
    
    expect(wrapper.find('.address-bar__route-seperator')).toHaveLength(2);
  });
});
