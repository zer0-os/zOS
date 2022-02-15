import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';

import { AddressBar } from '.';

describe('AddressBar', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      route: '',
      ...props,
    };

    return shallow(<AddressBar {...allProps} />);
  };

  it('adds class', () => {
    const wrapper = subject({ className: 'the-class' });
    
    expect(wrapper.find('.address-bar').hasClass('the-class')).toBe(true);
  });

  it('renders protocol', () => {
    const wrapper = subject({ route: 'food.street.tacos' });
    
    expect(wrapper.find('.address-bar__protocol').text().trim()).toStrictEqual('0://');
  });

  it('renders route in segments', () => {
    const wrapper = subject({ route: 'food.street.tacos' });
    
    const segments = wrapper.find('.address-bar__route-segment').map(segment => segment.text().trim());

    expect(segments).toStrictEqual(['food', 'street', 'tacos']);
  });

  it.only('renders Link to route at segment', () => {
    const wrapper = subject({ route: 'food.street.tacos' });
    
    const segments = wrapper.find(Link);

    expect(segments.at(0).prop('to')).toStrictEqual('food');
    expect(segments.at(1).prop('to')).toStrictEqual('food.street');
  });

  it('renders route seperators', () => {
    const wrapper = subject({ route: 'food.street.tacos' });
    
    expect(wrapper.find('.address-bar__route-seperator')).toHaveLength(2);
  });
});
