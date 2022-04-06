import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { Container } from './container';
import { AppMenu } from './index';
import { Apps } from '../../lib/apps';

describe('AppMenuContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      route: '',
      selectedApp: '',
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes route', () => {
    const route = 'the.cats.pantaloons'
    const wrapper = subject({ route });

    expect(wrapper.find(AppMenu).prop('route')).toBe(route);
  });

  it('passes selectedApp', () => {
    const selectedApp = Apps.Feed;
    const wrapper = subject({ selectedApp });

    expect(wrapper.find(AppMenu).prop('selectedApp')).toBe(Apps[selectedApp]);
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) => Container.mapState({
      ...state,
      zns: { value: { route: '' }, ...(state.zns || {}), },
      apps: { selectedApp: '', ...(state.apps || {}) },
    } as RootState);

    test('route', () => {
      const deepestVisitedRoute = 'NetBIOS';

      const state = subject({ zns: { value: { deepestVisitedRoute } }});

      expect(state.route).toEqual(deepestVisitedRoute);
    });

    test('selectedApp', () => {
      const selectedApp = 'Trumpet Winsock';

      const state = subject({ apps: { selectedApp } });

      expect(state.selectedApp).toEqual(selectedApp);
    });
  });
});
