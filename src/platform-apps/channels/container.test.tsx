import React from 'react';
import { Provider } from 'react-redux';
import { RootState } from '../../store';
import { Redirect } from 'react-router-dom';

import { shallow } from 'enzyme';

import { Container } from './container';

import { ChannelList } from './channel-list';
import { AppContextPanel } from '@zer0-os/zos-component-library';
import { Connectors } from '../../lib/web3';
import { ChatViewContainer } from '../../components/chat-view-container/chat-view-container';

describe('ChannelsContainer', () => {
  const getStore = (store?: any) => ({
    subscribe: () => undefined,
    dispatch: () => undefined,
    getState: () => undefined,
    ...(store || {}),
  });

  const subject = (props: any = {}) => {
    const allProps = {
      store: getStore(),
      fetchChannels: () => undefined,
      receiveUnreadCount: () => undefined,
      stopSyncChannels: () => undefined,
      channelId: '',
      match: { url: '' },
      user: {
        data: null,
      },
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

  it('set receiveUnreadCount channels on mount', () => {
    const domainId = '0x000000000000000000000000000000000000000A';
    const fetchChannels = jest.fn();
    const receiveUnreadCount = jest.fn();

    subject({ domainId, fetchChannels, receiveUnreadCount });

    expect(receiveUnreadCount).toHaveBeenCalledWith(domainId);
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

  it('passes channelId to ChannelList', () => {
    const channelId = 'one';

    const wrapper = subject({ channels: [{ id: 'one' }], channelId });

    expect(wrapper.find(ChannelList).prop('currentChannelId')).toStrictEqual(channelId);
  });

  it('does not render ChatViewContainer if no channel id', () => {
    const wrapper = subject({ channelId: '' });

    expect(wrapper.find(ChatViewContainer).exists()).toBe(false);
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

  it('passes channelId to ChatViewContainer', () => {
    const channelId = 'the-channel-id';

    const wrapper = subject({ channelId });

    expect(wrapper.find(ChatViewContainer).prop('channelId')).toStrictEqual(channelId);
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
        authentication: {
          ...(state.authentication || {}),
        },
        web3: {
          ...(state.web3 || {
            value: {
              address: '0x0',
              connector: Connectors.None,
            },
          }),
        },
      } as RootState);

    test('channels', () => {
      const state = subject({
        channelsList: {
          value: [
            'the-id',
            'the-second-id',
            'the-conversation-id',
          ],
        },
        normalized: {
          // Note: There's currently a bug where we're labelling channels as isChannel: false
          // and Conversations as true.
          channels: {
            'the-id': { id: 'the-id', name: 'the channel', isChannel: false },
            'the-second-id': { id: 'the-second-id', name: 'the second channel', isChannel: false },
            'the-third-id': { id: 'the-third-id', name: 'the third channel', isChannel: false },
            'the-conversation-id': { id: 'the-conversation-id', name: 'the conversation', isChannel: true },
          },
        },
      });

      expect(state.channels.map((c) => c.id)).toEqual([
        'the-id',
        'the-second-id',
      ]);
    });

    test('domainId', () => {
      const rootDomainId = '0x000000000000000000000000000000000000000A';

      const state = subject({ zns: { value: { rootDomainId } } as any });

      expect(state.domainId).toEqual(rootDomainId);
    });
  });
});
