import { RootState } from '../../store';

import { shallow } from 'enzyme';

import { Container } from './channel-view-container';
import { ChannelView } from './channel-view';
import { Message } from '../../store/messages';

describe('ChannelViewContainer', () => {
  const USER_DATA = {
    userId: '12',
  };
  const subject = (props: any = {}) => {
    const allProps = {
      channel: null,
      channelId: '',
      fetchMessages: () => undefined,
      joinChannel: () => undefined,
      user: {
        isLoading: false,
        data: null,
      },
      sendMessage: () => undefined,
      uploadFileMessage: () => undefined,
      fetchUsers: () => undefined,
      deleteMessage: () => undefined,
      editMessage: () => undefined,
      markAllMessagesAsReadInChannel: () => undefined,
      startMessageSync: () => undefined,
      stopSyncChannels: () => undefined,
      context: {
        isAuthenticated: false,
      },
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

  it('passes hasJoined to channel view', () => {
    const wrapper = subject({ channel: { hasJoined: true } });

    expect(wrapper.find(ChannelView).prop('hasJoined')).toStrictEqual(true);
  });

  it('passes hasJoined or is direct message to channel view', () => {
    const wrapper = subject({ channel: { hasJoined: false }, isDirectMessage: true });

    expect(wrapper.find(ChannelView).prop('hasJoined')).toStrictEqual(true);
  });

  it('passes is direct message to channel view', () => {
    const wrapper = subject({ channel: {}, isDirectMessage: true });

    expect(wrapper.find(ChannelView).prop('isDirectMessage')).toStrictEqual(true);
  });

  it('should mark all messages as read when unReadCount > 0', () => {
    const markAllMessagesAsReadInChannel = jest.fn();
    const messages = [
      { id: 'the-second-message-id', message: 'the second message', createdAt: 1659016677502 },
      { id: 'the-first-message-id', message: 'the first message', createdAt: 1658776625730 },
      { id: 'the-third-message-id', message: 'the third message', createdAt: 1659016677502 },
    ] as unknown as Message[];

    const wrapper = subject({
      markAllMessagesAsReadInChannel,
      channelId: 'the-channel-id',
      user: {
        isLoading: false,
        data: { id: 'user-id' },
      },
      channel: { name: 'the channel', unreadCount: 3, messages },
    });

    wrapper.setProps({}); // trigger didUpdate
    expect(markAllMessagesAsReadInChannel).toHaveBeenCalledWith({ channelId: 'the-channel-id', userId: 'user-id' });
  });

  it('fetches messages on mount', () => {
    const fetchMessages = jest.fn();

    subject({ fetchMessages, channelId: 'the-channel-id' });

    expect(fetchMessages).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('fetches users on mount', () => {
    const fetchUsers = jest.fn();

    subject({ fetchUsers, channelId: 'the-channel-id' });

    expect(fetchUsers).not.toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('fetches messages when channel id is set', () => {
    const fetchMessages = jest.fn();
    const stopSyncChannels = jest.fn();

    const wrapper = subject({
      fetchMessages,
      stopSyncChannels,
      channelId: '',
      channel: { name: 'first channel', shouldSyncChannels: false },
    });

    wrapper.setProps({ channelId: 'the-channel-id' });

    expect(fetchMessages).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('fetches users when users is set', () => {
    const fetchUsers = jest.fn();

    const wrapper = subject({
      fetchUsers,
      channelId: 'the-channel-id',
      channel: { name: 'first channel', shouldSyncChannels: false },
      context: {
        isAuthenticated: true,
      },
    });

    wrapper.setProps({
      user: {
        isLoading: false,
        data: USER_DATA,
      },
    });

    expect(fetchUsers).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('fetches users when channel id is updated', () => {
    const fetchUsers = jest.fn();

    const wrapper = subject({
      fetchUsers,
      channelId: 'the-first-channel-id',
      channel: { name: 'first channel', shouldSyncChannels: false },
      user: {
        isLoading: false,
        data: USER_DATA,
      },
      context: {
        isAuthenticated: true,
      },
    });

    wrapper.setProps({
      channelId: 'the-channel-id',
    });

    expect(fetchUsers).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('fetches messages when channel id is updated', () => {
    const fetchMessages = jest.fn();
    const stopSyncChannels = jest.fn();

    const wrapper = subject({
      fetchMessages,
      stopSyncChannels,
      channelId: 'the-first-channel-id',
      channel: { name: 'first channel', shouldSyncChannels: false },
    });

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
    const mentionedUserIds = ['ef698a51-1cea-42f8-a078-c0f96ed03c9e'];

    const wrapper = subject({
      sendMessage,
      channelId: 'the-channel-id',
      channel: { hasMore: true, name: 'first channel' },
    });

    wrapper.find(ChannelView).first().prop('sendMessage')(message, mentionedUserIds, []);

    expect(sendMessage).toHaveBeenCalledOnce();
  });

  it('should call uploadFileMessage when media is uploaded', () => {
    const uploadFileMessage = jest.fn();
    const media = [
      {
        id: 'id image 1',
        url: 'url media',
        name: 'image 1',
      },
    ];

    const wrapper = subject({
      uploadFileMessage,
      channelId: 'the-channel-id',
      channel: { hasMore: true, name: 'first channel' },
    });

    wrapper.find(ChannelView).first().prop('sendMessage')('', [], media);

    expect(uploadFileMessage).toHaveBeenCalledOnce();
  });

  it('should call joinChannel when join button is clicked', () => {
    const joinChannel = jest.fn();

    const wrapper = subject({
      joinChannel,
      channelId: 'the-channel-id',
      channel: { hasMore: true, name: 'first channel' },
    });

    wrapper.find(ChannelView).first().prop('joinChannel')();

    expect(joinChannel).toHaveBeenCalledOnce();
  });

  it('should call deleteMessage', () => {
    const deleteMessage = jest.fn();
    const messageId = 2345221;

    const wrapper = subject({
      deleteMessage,
      channelId: 'the-channel-id',
      channel: { hasMore: true, name: 'first channel' },
    });

    wrapper.find(ChannelView).first().prop('deleteMessage')(messageId);

    expect(deleteMessage).toHaveBeenCalledOnce();
  });

  it('should call editMessage', () => {
    const editMessage = jest.fn();
    const messageId = 2345221;
    const message = 'update message';
    const mentionedUserIds = [];

    const wrapper = subject({
      editMessage,
      channelId: 'the-channel-id',
      channel: { hasMore: true, name: 'first channel' },
    });

    wrapper.find(ChannelView).first().prop('editMessage')(messageId, message, mentionedUserIds);

    expect(editMessage).toHaveBeenCalledOnce();
  });

  it('startMessageSync messages when channel id is set', () => {
    const startMessageSync = jest.fn();
    const stopSyncChannels = jest.fn();

    const wrapper = subject({
      startMessageSync,
      stopSyncChannels,
      channelId: '',
      channel: { name: 'first channel', shouldSyncChannels: false },
    });

    wrapper.setProps({ channelId: 'the-channel-id', channel: { shouldSyncChannels: true } });

    expect(startMessageSync).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('should sync channel when user is authenticated', () => {
    const startMessageSync = jest.fn();

    const wrapper = subject({
      startMessageSync,
      channelId: '',
      channel: { name: 'first channel', shouldSyncChannels: false },
      context: {
        isAuthenticated: false,
      },
    });

    wrapper.setProps({
      channelId: 'the-channel-id',
      channel: { shouldSyncChannels: true },
      context: {
        isAuthenticated: true,
      },
    });

    expect(startMessageSync).not.toHaveBeenCalled();
  });

  it('should call hasMoreMessages when new messages arrive', async () => {
    const startMessageSync = jest.fn();
    const messages = [
      { id: 'the-second-message-id', message: 'the second message', createdAt: 100000001 },
      { id: 'the-first-message-id', message: 'the first message', createdAt: 100000002 },
    ] as unknown as Message[];

    const newMessages = [
      { id: 'the-second-message-id', message: 'the second message', createdAt: 100000001 },
      { id: 'the-first-message-id', message: 'the first message', createdAt: 100000002 },
      { id: 'the-third-message-id', message: 'the third message', createdAt: 100000003 },
      { id: 'the-fourth-message-id', message: 'the fourth message', createdAt: 100000004 },
    ] as unknown as Message[];

    const wrapper = subject({
      startMessageSync,
      channelId: 'the-channel-id',
      channel: { hasMore: true, name: 'first channel', messages },
    });

    wrapper.setProps({
      channelId: 'the-channel-id',
      channel: { name: 'first channel', messages: newMessages, countNewMessages: 2 },
    });

    expect(wrapper.find(ChannelView).prop('countNewMessages')).toStrictEqual(2);
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

  it('should call focus on message input render', () => {
    const textareaRef = {
      current: {
        focus: jest.fn(),
      },
    };

    const wrapper = subject();

    (wrapper.instance() as any).onMessageInputRendered(textareaRef);

    expect(textareaRef.current.focus).toHaveBeenCalled();
  });

  describe('mapState', () => {
    const getState = (state: any) =>
      ({
        normalized: {
          ...(state.normalized || {}),
        },
        authentication: {
          user: {
            isLoading: false,
            data: null,
          },
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
