import React from 'react';
import { Provider } from 'react-redux';
import { RootState } from '../../store';

import { shallow } from 'enzyme';

import { Container } from './container';
import { Channels } from '.';
import { Connect } from './connect';

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
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('wraps Connect component in provider', () => {
    const store = getStore({ what: 'no' }) as any;

    const wrapper = subject({ store });

    expect(wrapper.find(Provider).prop('store')).toStrictEqual(store);
    expect(wrapper.find(Provider).find(Connect).exists()).toBe(true);
  });

  it('renders Channels component if user account matches channelsAccount', () => {
    const account = '0x000000000000000000000000000000000000000A';

    const wrapper = subject({ user: { account }, channelsAccount: account });

    expect(wrapper.find(Connect).exists()).toBe(false);
    expect(wrapper.find(Channels).exists()).toBe(true);
  });

  it('renders connect component if no user account present', () => {
    const wrapper = subject({ user: { account: '' } });

    expect(wrapper.find(Connect).exists()).toBe(true);
  });

  it('passes account to connect component', () => {
    const wrapper = subject({ user: { account: '0x000000000000000000000000000000000000000A' } });

    expect(wrapper.find(Connect).prop('account')).toStrictEqual('0x000000000000000000000000000000000000000A');
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
