import React from 'react';
import { Provider } from 'react-redux';
import { RootState } from '../../store';

import { shallow } from 'enzyme';

import { Container } from './container';
import { Channels } from '.';

describe('ChannelsContainer', () => {
  const getStore = (store?: any) => ({
    subscribe: () => undefined,
    dispatch: () => undefined,
    getState: () => undefined,
    ...(store || {})
  });

  const subject = (props: any = {}) => {
    const allProps = {
      user: {},
      store: getStore(),
      connect: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('wraps child component in provider', () => {
    const store = getStore({ what: 'no' }) as any;

    const wrapper = subject({ store });

    expect(wrapper.find(Provider).prop('store')).toStrictEqual(store);
    expect(wrapper.find(Provider).find(Channels).exists()).toBe(true);
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) => Container.mapState({
      channels: {
        // status: ConnectionStatus.Connecting,
        ...(state.channels || {}),
        value: {
          account: '',
          ...((state.channels || {}).value || {}),
        },
      },
    } as RootState);

    test('channelsAccount', () => {
      const account = '0x000000000000000000000000000000000000000A';

      const state = subject({ channels: { value: { account } } as any });

      expect(state.channelsAccount).toEqual(account);
    });
  });
});
