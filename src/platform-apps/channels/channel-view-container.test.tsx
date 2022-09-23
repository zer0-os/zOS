import React from 'react';
import { RootState } from '../../store';

import { shallow } from 'enzyme';

import { Container } from './channel-view-container';
import { ChannelView } from './channel-view';
import { Message } from '../../store/messages';

describe('ChannelViewContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      channel: null,
      channelId: '',
      fetchMessages: () => undefined,
      sendMessage: () => undefined,
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

    expect(fetchMessages).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('fetches messages when channel id is set', () => {
    const fetchMessages = jest.fn();

    const wrapper = subject({ fetchMessages, channelId: '' });

    wrapper.setProps({ channelId: 'the-channel-id' });

    expect(fetchMessages).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('fetches messages when channel id is updated', () => {
    const fetchMessages = jest.fn();

    const wrapper = subject({ fetchMessages, channelId: 'the-first-channel-id' });

    wrapper.setProps({ channelId: 'the-channel-id' });

    expect(fetchMessages).toHaveBeenLastCalledWith({ channelId: 'the-channel-id' });
  });

  it('should call fetchMore with reference timestamp when hasMore is true', () => {
    const fetchMessages = jest.fn();
    const messages = [
      { id: 'the-second-message-id', message: 'the second message', createdAt: 1659016677502 },
      { id: 'the-first-message-id', message: 'the first message', createdAt: 1658776625730 },
      { id: 'the-third-message-id', message: 'the third message', createdAt: 1659016677502 },
    ] as unknown as Message[];

    const wrapper = subject({
      fetchMessages,
      channelId: 'the-channel-id',
      channel: { hasMore: true, name: 'first channel', messages },
    });

    wrapper.find(ChannelView).prop('onFetchMore')();

    expect(fetchMessages).toHaveBeenLastCalledWith({
      channelId: 'the-channel-id',
      referenceTimestamp: 1658776625730,
    });
  });

  it('should call sendMessage when textearea is clicked', () => {
    const sendMessage = jest.fn();
    const message = 'test message';

    const wrapper = subject({
      sendMessage,
      channelId: 'the-channel-id',
      channel: { hasMore: true, name: 'first channel' },
    });

    wrapper.find(ChannelView).first().prop('sendMessage')(message);

    expect(sendMessage).toHaveBeenCalledOnce();
  });

  it('should not call fetchMore when hasMore is false', () => {
    const fetchMessages = jest.fn();
    const messages = [
      { id: 'the-second-message-id', message: 'the second message', createdAt: 1659016677502 },
      { id: 'the-first-message-id', message: 'the first message', createdAt: 1658776625730 },
      { id: 'the-third-message-id', message: 'the third message', createdAt: 1659016677502 },
    ] as unknown as Message[];

    const wrapper = subject({
      fetchMessages,
      channelId: 'the-channel-id',
      channel: { hasMore: false, name: 'first channel', messages },
    });

    wrapper.find(ChannelView).prop('onFetchMore')();

    expect(fetchMessages).not.toHaveBeenLastCalledWith({
      channelId: 'the-channel-id',
      filter: {
        lastCreatedAt: 1658776625730,
      },
    });
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
              hasMore: true,
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

      expect(channel.hasMore).toEqual(true);
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
