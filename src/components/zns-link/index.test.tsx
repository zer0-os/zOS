import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';
import { Apps } from '../../lib/apps';

import { Component as ZnsLink } from '.';

describe('ZnsLink', () => {
  const subject = (props: any = {}, children = <div />) => {
    const allProps = {
      location: { pathname: '' },
      ...props,
    };

    return shallow(<ZnsLink {...allProps}>{children}</ZnsLink>);
  };

  it('adds className to child', () => {
    const wrapper = subject({ className: 'tacos' });

    expect(wrapper.find('.zns-link').hasClass('tacos')).toBe(true);
  });

  it('renders link for route with app', () => {
    const wrapper = subject({ app: Apps.Feed, route: 'tacos.street.pollo' });

    expect(wrapper.find(Link).prop('to')).toBe('/tacos.street.pollo/feed');
  });

  it('uses current route if no route provided', () => {
    const wrapper = subject({ location: { pathname: '/burgers.cheese/feed' }, app: Apps.Members });

    expect(wrapper.find(Link).prop('to')).toBe('/burgers.cheese/members');
  });

  it('uses current app if no app provided', () => {
    const wrapper = subject({ location: { pathname: '/burgers.cheese/feed' }, route: 'tacos.street.pollo' });

    expect(wrapper.find(Link).prop('to')).toBe('/tacos.street.pollo/feed');
  });

  it('renders children', () => {
    const wrapper = subject({ route: 'tacos.street.pollo' }, <div className='tacos' />);

    expect(wrapper.find(Link).find('.tacos').exists()).toBe(true);
  });
});
