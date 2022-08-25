import React from 'react';
import { shallow } from 'enzyme';

import { AddressBar, AddressBarMode } from '.';
import { Apps } from '../../lib/apps';
import { Icons, IconButton, ZnsLink } from '@zer0-os/zos-component-library';

import { ZNSDropdown } from '../zns-dropdown';

let onSelect;

describe('AddressBar', () => {
  beforeEach(() => {
    onSelect = jest.fn();
  });

  const subject = (props: any = {}) => {
    const allProps = {
      route: '',
      app: Apps.Feed,
      onSelect,
      addressBarMode: null,
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
    const wrapper = subject({ app: { type: Apps.Feed, name: 'Feed' } });

    expect(wrapper.find('[className$="trigger-region"] .address-bar__route-app').text().trim()).toStrictEqual('Feed');
  });

  it('does not render app name no app selected', () => {
    const wrapper = subject({ app: null });

    expect(wrapper.find('[className$="trigger-region"] .address-bar__route-app').exists()).toBe(false);
  });

  it('renders route in segments', () => {
    const wrapper = subject({ route: 'food.street.tacos' });

    const segments = wrapper.find('.address-bar__route-segment').map((segment) => segment.children().text().trim());

    expect(segments).toStrictEqual([
      'food',
      'street',
      'tacos',
    ]);
  });

  it('renders ZnsLink to route with app at segment', () => {
    const app = { type: Apps.Feed };
    const wrapper = subject({ route: 'food.street.tacos', app });

    const segments = wrapper.find(ZnsLink);

    expect(segments.at(0).props()).toMatchObject({
      route: 'food',
      app: Apps.Feed,
    });

    expect(segments.at(1).props()).toMatchObject({
      route: 'food.street',
      app: Apps.Feed,
    });
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

  it('shows search when trigger zone is clicked', () => {
    const wrapper = subject();

    expect(wrapper.find(ZNSDropdown).exists()).toBe(false);

    wrapper.find('[className$="trigger-region"]').simulate('click');

    expect(wrapper.find(ZNSDropdown).exists()).toBe(true);
  });

  it('hides search when item is selected', () => {
    const wrapper = subject({ addressBarMode: 'search' });

    wrapper.find(ZNSDropdown).simulate('Select');

    expect(wrapper.find(ZNSDropdown).exists()).toBe(false);
  });

  it('onSelect is mapped', () => {
    const expectation = 'zns-route';

    const wrapper = subject({ addressBarMode: AddressBarMode.Search });

    wrapper.find(ZNSDropdown).simulate('Select', expectation);

    expect(onSelect).toHaveBeenCalledWith(expectation);
  });

  it('hides search when click out side', () => {
    const wrapper = subject();

    wrapper.find('[className$="trigger-region"]').simulate('click');

    expect(wrapper.find(ZNSDropdown).exists()).toBe(true);

    wrapper.find(ZNSDropdown).props().onCloseBar();

    expect(wrapper.find(ZNSDropdown).exists()).toBe(false);
  });

  it('renders underlay when search selected', () => {
    const wrapper = subject({});

    wrapper.find('.address-bar__search-trigger-region').simulate('click');

    expect(wrapper.find('.address-bar__underlay').exists()).toBe(true);
  });

  it('does not render underlay', () => {
    const wrapper = subject({});

    expect(wrapper.find('.address-bar__underlay').exists()).toBe(false);
  });
});
