import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { AddressBar } from '.';
import { Container } from './container';
import { ProviderService } from '../../lib/web3/provider-service';
import { Apps, PlatformApp } from '../../lib/apps';
import { ZnsDomainDescriptor } from '../../store/zns';
import { config } from '../../config';

describe('AddressBarContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      route: '',
      app: '',
      deepestVisitedRoute: '',
      history: { push: () => undefined },
      providerService: { get: () => null } as ProviderService,
      znsClient: { get: () => null },
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  const getAppFor = (app: Apps) => ({ type: app });

  it('passes route to address bar', () => {
    const wrapper = subject({ route: 'the.cats.pajamas' });

    expect(wrapper.find(AddressBar).prop('route')).toBe('the.cats.pajamas');
  });

  it('passes app to address bar', () => {
    const selectedApp = { type: Apps.Channels } as PlatformApp;

    const wrapper = subject({ app: selectedApp });

    expect(wrapper.find(AddressBar).prop('app')).toBe(selectedApp);
  });

  it('passes className to address bar', () => {
    const wrapper = subject({ className: 'the-class' });

    expect(wrapper.find(AddressBar).prop('className')).toBe('the-class');
  });

  it('passes canGoForward of false if route matches deepestVisitedRoute', () => {
    const wrapper = subject({ route: 'cats', deepestVisitedRoute: 'cats' });

    expect(wrapper.find(AddressBar).prop('canGoForward')).toBe(false);
  });

  it('passes canGoForward of true if route does not match deepestVisitedRoute', () => {
    const wrapper = subject({
      route: 'cats.alley',
      deepestVisitedRoute: 'cats.alley.tomcats',
    });

    expect(wrapper.find(AddressBar).prop('canGoForward')).toBe(true);
  });

  it('passes canGoForward of false if route is not a subset of deepestVisitedRoute', () => {
    const wrapper = subject({
      route: 'cats.barn',
      deepestVisitedRoute: 'cats.alley.tomcats',
    });

    expect(wrapper.find(AddressBar).prop('canGoForward')).toBe(false);
  });

  it('passes canGoBack of false if at root domain', () => {
    const wrapper = subject({ route: 'cats' });

    expect(wrapper.find(AddressBar).prop('canGoBack')).toBe(false);
  });

  it('passes canGoBack of true if not at root domain', () => {
    const wrapper = subject({ route: 'cats.alley' });

    expect(wrapper.find(AddressBar).prop('canGoBack')).toBe(true);
  });

  it('navigates to next deepest route when onForward is called', () => {
    const push = jest.fn();

    const wrapper = subject({
      route: 'food',
      app: getAppFor(Apps.Feed),
      deepestVisitedRoute: 'food.tacos.bean.pinto',
      history: { push },
    });

    wrapper.find(AddressBar).simulate('forward');

    expect(push).toHaveBeenCalledWith('/food.tacos/feed');
  });

  it('does not navigate when forward is called if already at deepest route', () => {
    const push = jest.fn();

    const wrapper = subject({
      route: 'food.tacos.bean.pinto',
      deepestVisitedRoute: 'food.tacos.bean.pinto',
      history: { push },
    });

    wrapper.find(AddressBar).simulate('forward');

    expect(push).toHaveBeenCalledTimes(0);
  });

  it('navigates to previous route when onBack is called', () => {
    const push = jest.fn();
    const defaultApp = config.defaultApp;

    const wrapper = subject({
      route: 'food.tacos.bean',
      app: getAppFor(Apps.Staking),
      deepestVisitedRoute: 'food.tacos.bean.pinto',
      history: { push },
    });

    wrapper.find(AddressBar).simulate('back');

    expect(push).toHaveBeenCalledWith(`/food.tacos/${defaultApp}`);
  });

  it('does not navigate when onBack is called if already at root route', () => {
    const push = jest.fn();

    const wrapper = subject({
      route: 'food',
      deepestVisitedRoute: 'food.tacos.bean.pinto',
      history: { push },
    });

    wrapper.find(AddressBar).simulate('back');

    expect(push).toHaveBeenCalledTimes(0);
  });

  it('navigates to right routeApp if searching outside', () => {
    const push = jest.fn();
    const defaultApp = config.defaultApp;

    const wrapper = subject({
      route: 'food',
      app: getAppFor(Apps.Channels),
      deepestVisitedRoute: 'food.tacos.bean.pinto',
      history: { push },
    });

    wrapper.find(AddressBar).simulate('forward');

    expect(push).toHaveBeenCalledWith(`/food.tacos/${defaultApp}`);
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) => {
      const zns: any = state.zns || {};

      return Container.mapState({
        ...state,
        zns: {
          ...zns,
          value: {
            ...(zns.value || { deepestVisitedRoute: '', route: 'yo' }),
          },
        },
        apps: { ...(state.apps || {}) },
      } as RootState);
    };

    test('route', () => {
      const state = subject({
        zns: { value: { route: 'what.is.this' } as ZnsDomainDescriptor },
      });

      expect(state.route).toEqual('what.is.this');
    });

    test('app', () => {
      const state = subject({
        apps: { selectedApp: { type: Apps.Feed } as PlatformApp },
      });

      expect(state.app).toEqual({ type: Apps.Feed });
    });

    test('deepestVisitedRoute', () => {
      const state = subject({
        zns: {
          value: { deepestVisitedRoute: 'what.is.this' } as ZnsDomainDescriptor,
        },
      });

      expect(state.deepestVisitedRoute).toEqual('what.is.this');
    });
  });
});
