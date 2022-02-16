import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { AddressBar } from '.';
import { Container } from './container';

describe('AddressBarContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      route: '',
      deepestVisitedRoute: '',
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes route to address bar', () => {
    const wrapper = subject({ route: 'the.cats.pajamas' });

    expect(wrapper.find(AddressBar).prop('route')).toBe('the.cats.pajamas');
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
    const wrapper = subject({ route: 'cats.alley', deepestVisitedRoute: 'cats.alley.tomcats' });

    expect(wrapper.find(AddressBar).prop('canGoForward')).toBe(true);
  });

  it('passes canGoForward of false if route is not a subset of deepestVisitedRoute', () => {
    const wrapper = subject({ route: 'cats.barn', deepestVisitedRoute: 'cats.alley.tomcats' });

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

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) => Container.mapState({
      ...state,
      zns: {
        ...(state.zns || {}),
      },
    } as RootState);

    test('route', () => {
      const state = subject({ zns: { value: { route: 'what.is.this' } } });

      expect(state.route).toEqual('what.is.this');
    });

    test('deepestVisitedRoute', () => {
      const state = subject({ zns: { value: { deepestVisitedRoute: 'what.is.this' } } });

      expect(state.deepestVisitedRoute).toEqual('what.is.this');
    });
  });
});
