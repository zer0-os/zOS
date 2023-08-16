import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store/reducer';

import { Container } from './container';
import { AppMenu } from './index';
import { allApps, Apps, PlatformApp } from '../../lib/apps';

describe('AppMenuContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      selectedApp: '',
      config: { defaultZnsRoute: '' },
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes defaultZnsRoute to route', () => {
    const defaultZnsRoute = 'wilder';

    const wrapper = subject({ config: { defaultZnsRoute } });

    expect(wrapper.find(AppMenu).prop('route')).toBe(defaultZnsRoute);
  });

  it('passes apps to child', () => {
    const wrapper = subject();

    expect(wrapper.find(AppMenu).prop('apps')).toStrictEqual(allApps());
  });

  it('passes selectedApp', () => {
    const selectedApp = Apps.Channels;

    const wrapper = subject({ selectedApp });

    expect(wrapper.find(AppMenu).prop('selectedApp')).toBe(selectedApp);
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) =>
      Container.mapState({
        ...state,
        apps: { selectedApp: '', ...(state.apps || {}) },
      } as RootState);

    test('selectedApp', () => {
      const selectedApp = { type: Apps.Channels } as PlatformApp;

      const state = subject({ apps: { selectedApp } });

      expect(state.selectedApp).toEqual(Apps.Channels);
    });
  });
});
