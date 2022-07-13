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
      fetchMessages: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('does not render child if channel is not loaded', () => {
    const wrapper = subject({ channel: null });

    expect(wrapper.find(ChannelView).exists()).toStrictEqual(false);
  });

  it('passes messages to child', () => {
    const messages = [
      { id: 'message-one', message: 'what' },
      { id: 'message-two', message: 'hello' },
    ];

    const wrapper = subject({ channel: { messages } });

    expect(wrapper.find(ChannelView).prop('messages')).toStrictEqual(messages);
  });

  it('passes empty array for messages to child when channel has no messages', () => {
    const wrapper = subject({ channel: { id: 'what' } });

    expect(wrapper.find(ChannelView).prop('messages')).toStrictEqual([]);
  });

  it('passes channel name to child', () => {
    const wrapper = subject({ channel: { name: 'first channel' } });

    expect(wrapper.find(ChannelView).prop('name')).toStrictEqual('first channel');
  });

  it('fetches messages on mount', () => {
    const fetchMessages = jest.fn();

    subject({ fetchMessages, channelId: 'the-channel-id' });

    expect(fetchMessages).toHaveBeenCalledWith('the-channel-id');
  });

  it('fetches messages when channel id is set', () => {
    const fetchMessages = jest.fn();

    const wrapper = subject({ fetchMessages, channelId: '' });

    wrapper.setProps({ channelId: 'the-channel-id' });

    expect(fetchMessages).toHaveBeenCalledWith('the-channel-id');
  });

  it('fetches messages when channel id is updated', () => {
    const fetchMessages = jest.fn();

    const wrapper = subject({ fetchMessages, channelId: 'the-first-channel-id' });

    wrapper.setProps({ channelId: 'the-channel-id' });

    expect(fetchMessages).toHaveBeenLastCalledWith('the-channel-id');
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

    test('messages', () => {
      const state = getState({
        normalized: {
          messages: {
            'the-first-message-id': { id: 'the-first-message-id', name: 'the first message' },
            'the-second-message-id': { id: 'the-second-message-id', name: 'the second message' },
            'the-third-message-id': { id: 'the-third-message-id', name: 'the third message' },
          },
          channels: {
            'the-id': { id: 'the-id', name: 'the channel' },
            'the-second-id': {
              id: 'the-second-id',
              name: 'the second channel',
              messages: [
                'the-second-message-id',
                'the-third-message-id',
              ],
            },
            'the-third-id': { id: 'the-third-id', name: 'the third channel' },
          },
        },
      });

      const { channel } = Container.mapState(state, { channelId: 'the-second-id' });

      expect(channel.messages).toIncludeAllPartialMembers([
        { id: 'the-second-message-id', name: 'the second message' },
        { id: 'the-third-message-id', name: 'the third message' },
      ]);
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
