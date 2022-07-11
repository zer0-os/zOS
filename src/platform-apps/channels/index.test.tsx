import React from 'react';
import { Route } from 'react-router-dom';

import { shallow } from 'enzyme';

import { ChannelsContainer } from './container';
import { Component } from '.';

describe('Channels', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
      match: {
        path: '/the/path',
        ...(props.match || {}),
      },
    };

    return shallow(<Component {...allProps} />);
  };

  it('adds optional channelId to path in Route', () => {
    const wrapper = subject({ match: { path: '/the/path' } });

    expect(wrapper.find(Route).prop('path')).toBe('/the/path/:channelId?');
  });

  it('passes channelId to ChannelsContainer', () => {
    const RouteRenderComponent: any = subject().find(Route).prop('render');

    const channelId = 'the-channel-id';

    const rendered = shallow(<RouteRenderComponent match={{ params: { channelId } }} />);

    expect(rendered.find(ChannelsContainer).prop('channelId')).toBe('the-channel-id');
  });

  it('passes empty channelId to rendered component if no match', () => {
    const RouteRenderComponent: any = subject().find(Route).prop('render');

    const rendered = shallow(<RouteRenderComponent match={{ params: {} }} />);

    expect(rendered.prop('channelId')).toBeEmpty();
  });

  it('passes provided props to rendered component', () => {
    const RouteRenderComponent: any = subject({ route: 'the.route' }).find(Route).prop('render');

    const rendered = shallow(<RouteRenderComponent match={{ params: {} }} />);

    expect(rendered.prop('route')).toBe('the.route');
  });
});
