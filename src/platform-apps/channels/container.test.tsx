import React from 'react';
import { Provider } from 'react-redux';
import { RootState } from '../../store';
import { Redirect } from 'react-router-dom';

import { shallow } from 'enzyme';

import { Container } from './container';

import { ChannelList } from './channel-list';
import { ChannelViewContainer } from './channel-view-container';
import { AppContextPanel } from '../../shared-components/app-layout';

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
      channelId: '',
      match: { url: '' },
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('wraps child component in provider', () => {
    const store = getStore({ what: 'no' }) as any;

    const wrapper = subject({ store });

    expect(wrapper.find(Provider).prop('store')).toStrictEqual(store);
    expect(wrapper.find(Provider).find('.channels').exists()).toBe(true);
  });

  it('fetches channels on mount', () => {
    const domainId = '0x000000000000000000000000000000000000000A';
    const fetchChannels = jest.fn();

    subject({ domainId, fetchChannels });

    expect(fetchChannels).toHaveBeenCalledWith(domainId);
  });

  it('wraps ChannelList in AppContextPanel', () => {
    const wrapper = subject();

    const channelList = wrapper.find(AppContextPanel).find(ChannelList);

    expect(channelList.exists()).toBe(true);
  });

  it('passes channels to ChannelList', () => {
    const channels = [{ id: 'one' }];

    const wrapper = subject({ channels });

    expect(wrapper.find(ChannelList).prop('channels')).toStrictEqual(channels);
  });

  it('does not render ChannelViewContainer if no channel id', () => {
    const wrapper = subject({ channelId: '' });

    expect(wrapper.find(ChannelViewContainer).exists()).toBe(false);
  });

  it('redirects to first channel if no channelId', () => {
    const wrapper = subject({
      match: { url: '/root/url' },
      channelId: '',
      channels: [{ id: 'the-channel-id' }],
    });

    expect(wrapper.find(Redirect).prop('to')).toStrictEqual('/root/url/the-channel-id');
  });

  it('redirects to first channel if no channelId on update', () => {
    const wrapper = subject({
      match: { url: '/root/url' },
      channelId: '',
      channels: [],
    });

    wrapper.setProps({
      channels: [{ id: 'the-channel-id' }],
    });

    expect(wrapper.find(Redirect).prop('to')).toStrictEqual('/root/url/the-channel-id');
  });

  it('passes channelId to ChannelViewContainer', () => {
    const channelId = 'the-channel-id';

    const wrapper = subject({ channelId });

    expect(wrapper.find(ChannelViewContainer).prop('channelId')).toStrictEqual(channelId);
  });

  describe('mapState', () => {
    const subject = (state: any) =>
      Container.mapState({
        ...state,
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
