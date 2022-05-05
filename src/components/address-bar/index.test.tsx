import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';

import { AddressBar } from '.';
import { Apps } from '../../lib/apps';
import { Icons, IconButton } from '@zer0-os/zos-component-library';

describe('AddressBar', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      route: '',
      app: Apps.Feed,
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

  it('renders app name', () => {
    const wrapper = subject({ app: { type: Apps.Feed, name: 'Feed' }});
    
    expect(wrapper.find('.address-bar__route .address-bar__route-app').text().trim()).toStrictEqual('Feed');
  });

  it('does not render app name no app selected', () => {
    const wrapper = subject({ app: null });
    
    expect(wrapper.find('.address-bar__route .address-bar__route-app').exists()).toBe(false);
  });

  it('renders route in segments', () => {
    const wrapper = subject({ route: 'food.street.tacos' });
    
    const segments = wrapper.find('.address-bar__route-segment').map(segment => segment.text().trim());

    expect(segments).toStrictEqual(['food', 'street', 'tacos']);
  });

  it('renders Link to route with app at segment', () => {
    const app = { type: Apps.Feed };
    const wrapper = subject({ route: 'food.street.tacos', app });
    
    const segments = wrapper.find(Link);

    expect(segments.at(0).prop('to')).toStrictEqual('/food/feed');
    expect(segments.at(1).prop('to')).toStrictEqual('/food.street/feed');
  });

  it('does not add app link if no selected app', () => {
    const wrapper = subject({ route: 'food.street.tacos', app: null });
    
    const segments = wrapper.find(Link);

    expect(segments.at(0).prop('to')).toStrictEqual('/food');
  });

  it('renders route seperators', () => {
    const wrapper = subject({ route: 'food.street.tacos' });
    
    expect(wrapper.find('.address-bar__route-seperator')).toHaveLength(2);
  });

  it('adds class when canGoBack is true', () => {
    const wrapper = subject({ canGoBack: true });

    expect(wrapper.find('.address-bar__navigation-button').at(0).hasClass('is-actionable')).toBe(true);
  });

  it('adds class when canGoForward is true', () => {
    const wrapper = subject({ canGoForward: true });

    expect(wrapper.find('.address-bar__navigation-button').at(1).hasClass('is-actionable')).toBe(true);
  });

  it('adds correct icon for back button', () => {
    const wrapper = subject();

    const backButton = wrapper.find(IconButton).at(0);

    expect(backButton.prop('icon')).toBe(Icons.ChevronLeft);
  });

  it('adds correct icon for forward button', () => {
    const wrapper = subject();

    const backButton = wrapper.find(IconButton).at(1);

    expect(backButton.prop('icon')).toBe(Icons.ChevronRight);
  });

  it('fires onBack when back button is clicked', () => {
    const onBack = jest.fn();

    const wrapper = subject({ onBack });

    wrapper.find('.address-bar__navigation-button').at(0).simulate('click');

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('fires onForward when forward button is clicked', () => {
    const onForward = jest.fn();

    const wrapper = subject({ onForward });

    wrapper.find('.address-bar__navigation-button').at(1).simulate('click');

    expect(onForward).toHaveBeenCalledOnce();
  });
});
