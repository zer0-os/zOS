import React from 'react';
import { RootState } from '../../store';

import { shallow } from 'enzyme';

import { Container } from './channel-view-container';
import { ChannelView } from './channel-view';

describe('ChannelViewContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      channel: null,
      channelId: '',
      fetchChannel: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('does not render child if channel is not loaded', () => {
    const wrapper = subject({ channel: null });

    expect(wrapper.find(ChannelView).exists()).toStrictEqual(false);
  });

  it('passes channel name to child', () => {
    const wrapper = subject({ channel: { name: 'first channel' } });

    expect(wrapper.find(ChannelView).prop('name')).toStrictEqual('first channel');
  });

  it('fetches channel on mount', () => {
    const fetchChannel = jest.fn();

    subject({ fetchChannel, channelId: 'the-channel-id' });

    expect(fetchChannel).toHaveBeenCalledWith('the-channel-id');
  });

  it('does not fetch channel if channel id is not set', () => {
    const fetchChannel = jest.fn();

    subject({ fetchChannel, channelId: '' });

    expect(fetchChannel).toHaveBeenCalledTimes(0);
  });

  it('fetches channel when channel id is set', () => {
    const fetchChannel = jest.fn();

    const wrapper = subject({ fetchChannel, channelId: '' });

    wrapper.setProps({ channelId: 'the-channel-id' });

    expect(fetchChannel).toHaveBeenCalledWith('the-channel-id');
  });

  it('fetches channel when channel id is updated', () => {
    const fetchChannel = jest.fn();

    const wrapper = subject({ fetchChannel, channelId: 'the-first-channel-id' });

    wrapper.setProps({ channelId: 'the-channel-id' });

    expect(fetchChannel).toHaveBeenLastCalledWith('the-channel-id');
  });

  describe('mapState', () => {
    const getState = (state: any) =>
      ({
        normalized: {
          ...(state.normalized || {}),
        },
      } as RootState);

    test('channel', () => {
      const state = getState({
        normalized: {
          channels: {
            'the-id': { id: 'the-id', name: 'the channel' },
            'the-second-id': { id: 'the-second-id', name: 'the second channel' },
            'the-third-id': { id: 'the-third-id', name: 'the third channel' },
          },
        },
      });

      const props = Container.mapState(state, { channelId: 'the-second-id' });

      expect(props.channel).toMatchObject({
        id: 'the-second-id',
        name: 'the second channel',
      });
    });

    test('channel with no id set', () => {
      const state = getState({
        normalized: {
          channels: {
            'the-id': { id: 'the-id', name: 'the channel' },
            'the-second-id': { id: 'the-second-id', name: 'the second channel' },
            'the-third-id': { id: 'the-third-id', name: 'the third channel' },
          },
        },
      });

      const props = Container.mapState(state, { channelId: '' });

      expect(props.channel).toBeNull();
    });
  });
});
