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
    ...(store || {}),
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

  it('passes channels to app', () => {
    const channels = [{ id: 'one' }];

    const wrapper = subject({ channels });

    expect(wrapper.find(Channels).prop('channels')).toStrictEqual(channels);
  });

  describe('mapState', () => {
    const subject = (state: any) =>
      Container.mapState({
        zns: {
          ...(state.zns || {}),
          value: {
            ...((state.zns || {}).value || { rootDomainId: '0x000000000000000000000000000000000000000A' }),
          },
        },
        channelsList: {
          value: [],
          ...(state.channelsList || {}),
        },
        normalized: {
          ...(state.normalized || {}),
        },
      } as RootState);

    test('channels', () => {
      const state = subject({
        channelsList: {
          value: [
            'the-id',
            'the-second-id',
          ],
        },
        normalized: {
          channels: {
            'the-id': { id: 'the-id', name: 'the channel' },
            'the-second-id': { id: 'the-second-id', name: 'the second channel' },
            'the-third-id': { id: 'the-third-id', name: 'the third channel' },
          },
        },
      });

      expect(state.channels).toIncludeAllPartialMembers([
        { id: 'the-id', name: 'the channel' },
        { id: 'the-second-id', name: 'the second channel' },
      ]);
    });

    test('domainId', () => {
      const rootDomainId = '0x000000000000000000000000000000000000000A';

      const state = subject({ zns: { value: { rootDomainId } } as any });

      expect(state.domainId).toEqual(rootDomainId);
    });
  });
});
