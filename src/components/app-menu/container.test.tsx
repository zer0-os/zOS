import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { Container } from './container';
import { AppMenu } from './index';
import { allApps, Apps, PlatformApp } from '../../lib/apps';

jest.mock('../../lib/feature-flags');

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

  it('passes apps to child', () => {
    const wrapper = subject();

    expect(wrapper.find(AppMenu).prop('apps')).toStrictEqual(allApps());
  });

  it('passes selectedApp', () => {
    const selectedApp = Apps.Feed;

    const wrapper = subject({ selectedApp });

    expect(wrapper.find(AppMenu).prop('selectedApp')).toBe(selectedApp);
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) => Container.mapState({
      ...state,
      zns: { value: { route: '' }, ...(state.zns || {}), },
      apps: { selectedApp: '', ...(state.apps || {}) },
    } as RootState);

    test('route', () => {
      const route = 'NetBIOS';

      const state = subject({ zns: { value: { route } }});

      expect(state.route).toEqual(route);
    });

    test('selectedApp', () => {
      const selectedApp = { type: Apps.Channels } as PlatformApp;

      const state = subject({ apps: { selectedApp } });

      expect(state.selectedApp).toEqual(Apps.Channels);
    });
  });
});
