import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { RootState } from './store';
import { AppSandbox, Apps } from '.';
import {ConnectionStatus} from '../lib/web3';

describe('AppSandboxContainer', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      route: '',
      connectionStatus: ConnectionStatus.Connected,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('does not render child when not connected', () => {
    const wrapper = subject({ connectionStatus: ConnectionStatus.Disconnected });

    expect(wrapper.find(AppSandbox).exists()).toBe(false);
  });

  it('defaults selected app to feed', () => {
    const wrapper = subject();

    expect(wrapper.find(AppSandbox).prop('selectedApp')).toBe(Apps.Feed);
  });

  it('passes route to sandbox', () => {
    const wrapper = subject({ route: 'tacos.street.pollo' });

    expect(wrapper.find(AppSandbox).prop('znsRoute')).toBe('tacos.street.pollo');
  });

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState({
      zns: { value: { route: '' }, ...(state.zns || {}) },
      web3: {
        status: ConnectionStatus.Connecting,
        ...(state.web3 || {}),
      },
    } as any);

    test('connectionStatus', () => {
      const state = subject({ web3: { status: ConnectionStatus.Connected } });

      expect(state.connectionStatus).toEqual(ConnectionStatus.Connected);
    });

    test('route', () => {
      const route = 'deep.fried.zucchini';

      const state = subject({ zns: { value: { route } } } as RootState);

      expect(state).toMatchObject({ route });
    });
  });
});
