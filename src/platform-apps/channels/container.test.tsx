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
      fetchChannels: () => undefined,
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

  it('fetches channels on mount', () => {
    const domainId = '0x000000000000000000000000000000000000000A';
    const fetchChannels = jest.fn();

    subject({ domainId, fetchChannels });

    expect(fetchChannels).toHaveBeenCalledWith(domainId);
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) => Container.mapState({
      zns: {
        ...(state.zns || {}),
        value: {
          ...((state.zns || {}).value || { rootDomainId: '0x000000000000000000000000000000000000000A' }),
        },
      },
      channels: {
        // status: ConnectionStatus.Connecting,
        ...(state.channels || {}),
        value: {
          account: '',
          ...((state.channels || {}).value || {}),
        },
      },
    } as RootState);

    test('domainId', () => {
      const rootDomainId = '0x000000000000000000000000000000000000000A';

      const state = subject({ zns: { value: { rootDomainId } } as any });

      expect(state.domainId).toEqual(rootDomainId);
    });
  });
});
