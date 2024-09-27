import { RootState } from '../../../../store/reducer';
import { shallow } from 'enzyme';
import { Container as FeedViewContainer } from './feed-view-container';
import { FeedView } from './feed-view';
import { MessageSendStatus } from '../../../../store/messages';

describe('FeedViewContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      channel: null,
      channelId: '',
      user: {
        isLoading: false,
        data: null,
      },
      activeConversationId: '',

      fetchPosts: () => undefined,
      ...props,
    };

    return shallow(<FeedViewContainer {...allProps} />);
  };

  it('does not render child if channel is not loaded', () => {
    const wrapper = subject({ channel: null });

    expect(wrapper.find(FeedView).exists()).toStrictEqual(false);
  });

  it('passes postMessages to child', () => {
    const messages = [
      { id: 'post-one', message: 'First post', isPost: true, sendStatus: MessageSendStatus.SUCCESS },
      { id: 'post-two', message: 'Second post', isPost: true, sendStatus: MessageSendStatus.SUCCESS },
    ];

    const wrapper = subject({ channel: { messages } });

    expect(wrapper.find(FeedView).prop('postMessages')).toStrictEqual(messages.reverse());
  });

  it('passes empty array for postMessages to child when channel has no messages', () => {
    const wrapper = subject({ channel: { id: 'channel-id' } });

    expect(wrapper.find(FeedView).prop('postMessages')).toStrictEqual([]);
  });

  it('fetches posts on mount if posts are not loaded', () => {
    const fetchPosts = jest.fn();

    subject({ fetchPosts, channelId: 'the-channel-id', channel: { hasLoadedMessages: false } });

    expect(fetchPosts).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('does not fetch posts on mount if posts are already loaded', () => {
    const fetchPosts = jest.fn();

    subject({ fetchPosts, channelId: 'the-channel-id', channel: { hasLoadedMessages: true } });

    expect(fetchPosts).not.toHaveBeenCalled();
  });

  it('fetches posts when channel id is set or updated if posts are not loaded', () => {
    const fetchPosts = jest.fn();

    const wrapper = subject({
      fetchPosts,
      channelId: '',
      channel: { hasLoadedMessages: false },
    });

    wrapper.setProps({ channelId: 'the-channel-id', channel: { hasLoadedMessages: false } });

    expect(fetchPosts).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('does not fetch posts when channel id is updated if posts are already loaded', () => {
    const fetchPosts = jest.fn();

    const wrapper = subject({
      fetchPosts,
      channelId: 'the-channel-id',
      channel: { hasLoadedMessages: true },
    });

    wrapper.setProps({ channelId: 'new-channel-id', channel: { hasLoadedMessages: true } });

    expect(fetchPosts).not.toHaveBeenCalled();
  });

  it('fetches posts when user data becomes available', () => {
    const fetchPosts = jest.fn();
    const wrapper = subject({
      fetchPosts,
      channelId: 'the-channel-id',
      channel: { hasLoadedMessages: false },
      user: { isLoading: false, data: null },
    });

    wrapper.setProps({ user: { isLoading: false, data: { id: 'user-id' } } });

    expect(fetchPosts).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('should call fetchMorePosts with reference timestamp when hasMorePosts is true', () => {
    const fetchPosts = jest.fn();
    const messages = [
      {
        id: 'post-one',
        message: 'First post',
        createdAt: 1658776625730,
        isPost: true,
        sendStatus: MessageSendStatus.SUCCESS,
      },
      {
        id: 'post-two',
        message: 'Second post',
        createdAt: 1659016677502,
        isPost: true,
        sendStatus: MessageSendStatus.SUCCESS,
      },
    ];

    const wrapper = subject({
      fetchPosts,
      channelId: 'the-channel-id',
      channel: { hasMorePosts: true, name: 'first channel', messages },
    });

    wrapper.find(FeedView).prop('onFetchMore')();

    expect(fetchPosts).toHaveBeenLastCalledWith({
      channelId: 'the-channel-id',
      referenceTimestamp: 1658776625730,
    });
  });

  it('should not call fetchMorePosts when hasMorePosts is false', () => {
    const fetchPosts = jest.fn();
    const messages = [
      {
        id: 'post-one',
        message: 'First post',
        createdAt: 1658776625730,
        isPost: true,
        sendStatus: MessageSendStatus.SUCCESS,
      },
      {
        id: 'post-two',
        message: 'Second post',
        createdAt: 1659016677502,
        isPost: true,
        sendStatus: MessageSendStatus.SUCCESS,
      },
    ];

    const wrapper = subject({
      fetchPosts,
      channelId: 'the-channel-id',
      channel: { hasMorePosts: false, name: 'first channel', messages },
    });

    wrapper.find(FeedView).prop('onFetchMore')();

    expect(fetchPosts).not.toHaveBeenLastCalledWith({
      channelId: 'the-channel-id',
      referenceTimestamp: 1658776625730,
    });
  });

  describe('mapState', () => {
    const getState = (state: any) =>
      ({
        normalized: {
          ...(state.normalized || {}),
        },
        authentication: {
          user: {
            data: null,
          },
        },
        chat: {
          activeConversationId: '1',
        },
        rewards: { meow: '0' },
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

      const props = FeedViewContainer.mapState(state, { channelId: 'the-second-id' });

      expect(props.channel).toMatchObject({
        id: 'the-second-id',
        name: 'the second channel',
      });
    });

    test('postMessages', () => {
      const state = getState({
        normalized: {
          messages: {
            'post-one': { id: 'post-one', message: 'First post', isPost: true, sendStatus: MessageSendStatus.SUCCESS },
            'post-two': { id: 'post-two', message: 'Second post', isPost: true, sendStatus: MessageSendStatus.SUCCESS },
          },
          channels: {
            'the-id': { id: 'the-id', name: 'the channel' },
            'the-second-id': {
              id: 'the-second-id',
              name: 'the second channel',
              hasMorePosts: true,
              messages: [
                'post-one',
                'post-two',
              ],
            },
            'the-third-id': { id: 'the-third-id', name: 'the third channel' },
          },
        },
      });

      const { channel } = FeedViewContainer.mapState(state, { channelId: 'the-second-id' });

      expect(channel.messages).toIncludeAllPartialMembers([
        { id: 'post-one', message: 'First post' },
        { id: 'post-two', message: 'Second post' },
      ]);

      expect(channel.hasMorePosts).toEqual(true);
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

      const props = FeedViewContainer.mapState(state, { channelId: '' });

      expect(props.channel).toBeNull();
    });
  });
});
