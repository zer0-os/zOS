import { RootState } from '../../store/reducer';

import { shallow } from 'enzyme';

import { Container } from './chat-view-container';
import { ChatView } from './chat-view';
import { Message } from '../../store/messages';
import { Media } from '../message-input/utils';
import { ConversationStatus } from '../../store/channels';

describe('ChannelViewContainer', () => {
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
      activeConversationId: '',
      sendMessage: () => undefined,
      uploadFileMessage: () => undefined,
      deleteMessage: () => undefined,
      editMessage: () => undefined,
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

    expect(wrapper.find(ChatView).exists()).toStrictEqual(false);
  });

  it('passes messages to child', () => {
    const messages = [
      { id: 'message-one', message: 'what' },
      { id: 'message-two', message: 'hello' },
    ];

    const wrapper = subject({ channel: { messages } });

    expect(wrapper.find(ChatView).prop('messages')).toStrictEqual(messages);
  });

  it('passes empty array for messages to child when channel has no messages', () => {
    const wrapper = subject({ channel: { id: 'what' } });

    expect(wrapper.find(ChatView).prop('messages')).toStrictEqual([]);
  });

  it('groups message media with rootId onto parent message', () => {
    const messages = [
      { id: 'message-root', rootMessageId: '' },
      { id: 'message-two', rootMessageId: '' },
      { id: 'message-child', rootMessageId: 'message-root', media: { some: 'media' } },
    ];

    const wrapper = subject({ channel: { messages } });

    expect(wrapper.find(ChatView).prop('messages')).toStrictEqual([
      { ...messages[0], media: { some: 'media' } },
      messages[1],
    ]);
  });

  it('groups message media with optimistic rootId onto parent message', () => {
    const messages = [
      { id: 'message-root', optimisticId: 'optimistic-message-root', rootMessageId: '' },
      { id: 'message-two', rootMessageId: '' },
      { id: 'message-child', rootMessageId: 'optimistic-message-root', media: { some: 'media' } },
    ];

    const wrapper = subject({ channel: { messages } });

    expect(wrapper.find(ChatView).prop('messages')).toStrictEqual([
      { ...messages[0], media: { some: 'media' } },
      messages[1],
    ]);
  });

  it('messages with rootMessageId but no parent found are still included', () => {
    const messages = [
      { id: 'message-one', message: 'what', rootMessageId: '' },
      { id: 'message-two', message: 'hello', rootMessageId: '' },
      { id: 'message-child', message: 'what', rootMessageId: 'message-root', media: { some: 'media' } },
    ];

    const wrapper = subject({ channel: { messages } });

    expect(wrapper.find(ChatView).prop('messages')).toStrictEqual([
      { id: 'message-one', message: 'what', rootMessageId: '' },
      { id: 'message-two', message: 'hello', rootMessageId: '' },
      { id: 'message-child', message: 'what', rootMessageId: 'message-root', media: { some: 'media' } },
    ]);
  });

  it('passes channel name to child', () => {
    const wrapper = subject({ channel: { name: 'first channel' } });

    expect(wrapper.find(ChatView).prop('name')).toStrictEqual('first channel');
  });

  it('passes hasJoined to channel view', () => {
    const wrapper = subject({ channel: { hasJoined: true } });

    expect(wrapper.find(ChatView).prop('hasJoined')).toStrictEqual(true);
  });

  it('passes hasJoined or is direct message to channel view', () => {
    const wrapper = subject({ channel: { hasJoined: false }, isDirectMessage: true });

    expect(wrapper.find(ChatView).prop('hasJoined')).toStrictEqual(true);
  });

  it('passes is direct message to channel view', () => {
    const wrapper = subject({ channel: {}, isDirectMessage: true });

    expect(wrapper.find(ChatView).prop('isDirectMessage')).toStrictEqual(true);
  });

  it('fetches messages on mount', () => {
    const fetchMessages = jest.fn();

    subject({ fetchMessages, channelId: 'the-channel-id' });

    expect(fetchMessages).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
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

    wrapper.find(ChatView).prop('onFetchMore')();

    expect(fetchMessages).toHaveBeenLastCalledWith({
      channelId: 'the-channel-id',
      referenceTimestamp: 1658776625730,
    });
  });

  it('should not send message if there is no channel id', () => {
    const sendMessage = jest.fn();
    const message = 'test message';

    const wrapper = subject({ sendMessage, channel: {} });

    wrapper.find(ChatView).first().prop('sendMessage')(message, [], []);

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('calls sendMessage when chat view publishes message', () => {
    const sendMessage = jest.fn();
    const message = 'test message';
    const mentionedUserIds = ['ef698a51-1cea-42f8-a078-c0f96ed03c9e'];
    const channelId = 'the-channel-id';

    const wrapper = subject({ sendMessage, channelId, channel: {} });

    wrapper.find(ChatView).first().prop('sendMessage')(message, mentionedUserIds, []);

    expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ channelId, message, mentionedUserIds }));
  });

  it('calls sendMessage with parent message a reply is included', () => {
    const sendMessage = jest.fn();
    const channelId = 'the-channel-id';

    const wrapper = subject({ sendMessage, channelId, channel: {} });

    wrapper.find(ChatView).simulate('reply', { id: 'parent' });
    wrapper.find(ChatView).first().prop('sendMessage')('message', [], []);

    expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ channelId, parentMessage: { id: 'parent' } }));
  });

  it('calls sendMessage with files', () => {
    const sendMessage = jest.fn();
    const channelId = 'the-channel-id';

    const wrapper = subject({ sendMessage, channelId, channel: {} });

    wrapper.find(ChatView).first().prop('sendMessage')('', [], [{ id: 'file-id', name: 'file-name' } as Media]);

    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ channelId, files: [{ id: 'file-id', name: 'file-name' }] })
    );
  });

  it('should call joinChannel when join button is clicked', () => {
    const joinChannel = jest.fn();

    const wrapper = subject({
      joinChannel,
      channelId: 'the-channel-id',
      channel: { hasMore: true, name: 'first channel' },
    });

    wrapper.find(ChatView).first().prop('joinChannel')();

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

    wrapper.find(ChatView).first().prop('deleteMessage')(messageId);

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

    wrapper.find(ChatView).first().prop('editMessage')(messageId, message, mentionedUserIds);

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

    wrapper.find(ChatView).prop('onFetchMore')();

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

  it('should not call focus on message input render if activeConversationId not equal the id of textareaRef', () => {
    const activeConversationId = '1';
    const textareaRef = {
      current: {
        focus: jest.fn(),
        id: '3',
      },
    };

    const wrapper = subject({ activeConversationId });

    (wrapper.instance() as any).onMessageInputRendered(textareaRef);

    expect(textareaRef.current.focus).not.toHaveBeenCalled();
  });

  it('should call focus on message input render if activeConversationId equal the id of textareaRef', () => {
    const activeConversationId = '1';
    const textareaRef = {
      current: {
        focus: jest.fn(),
        id: activeConversationId,
      },
    };

    const wrapper = subject({ activeConversationId });

    (wrapper.instance() as any).onMessageInputRendered(textareaRef);

    expect(textareaRef.current.focus).toHaveBeenCalled();
  });

  describe('sendDisabledMessage', () => {
    it('is empty if the channel is created', () => {
      const wrapper = subject({ channel: { conversationStatus: ConversationStatus.CREATED } });

      expect(wrapper.find('ChatView').prop('sendDisabledMessage')).toEqual('');
    });

    it('includes user name if one on one', () => {
      const otherMembers = [{ userId: '1', firstName: 'Jack', lastName: 'Black' }];
      const wrapper = subject({
        channel: { isOneOnOne: true, otherMembers, conversationStatus: ConversationStatus.CREATING },
      });

      expect(wrapper.find('ChatView').prop('sendDisabledMessage')).toEqual(
        "We're connecting you with Jack Black. Try again in a few seconds."
      );
    });

    it('includes conversation name if exists', () => {
      const wrapper = subject({ channel: { name: 'NamedGroup', conversationStatus: ConversationStatus.CREATING } });

      expect(wrapper.find('ChatView').prop('sendDisabledMessage')).toEqual(
        "We're connecting you with NamedGroup. Try again in a few seconds."
      );
    });

    it('references group if more than one member', () => {
      const otherMembers = [
        { userId: '1' },
        { userId: '2' },
      ];
      const wrapper = subject({ channel: { otherMembers, conversationStatus: ConversationStatus.CREATING } });

      expect(wrapper.find('ChatView').prop('sendDisabledMessage')).toEqual(
        "We're connecting you with the group. Try again in a few seconds."
      );
    });
  });

  describe('conversationErrorMessage', () => {
    it('is empty if the channel is not in error state', () => {
      const wrapper = subject({ channel: { conversationStatus: ConversationStatus.CREATED } });

      expect(wrapper.find('ChatView').prop('conversationErrorMessage')).toEqual('');
    });

    it('includes user name if one on one', () => {
      const otherMembers = [{ userId: '1', firstName: 'Jack', lastName: 'Black' }];
      const wrapper = subject({
        channel: { isOneOnOne: true, otherMembers, conversationStatus: ConversationStatus.ERROR },
      });

      expect(wrapper.find('ChatView').prop('conversationErrorMessage')).toEqual(
        "Sorry! We couldn't connect you with Jack Black. Please refresh and try again."
      );
    });

    it('includes conversation name if exists', () => {
      const wrapper = subject({ channel: { name: 'NamedGroup', conversationStatus: ConversationStatus.ERROR } });

      expect(wrapper.find('ChatView').prop('conversationErrorMessage')).toEqual(
        "Sorry! We couldn't connect you with NamedGroup. Please refresh and try again."
      );
    });

    it('references group if more than one member', () => {
      const otherMembers = [
        { userId: '1' },
        { userId: '2' },
      ];
      const wrapper = subject({ channel: { otherMembers, conversationStatus: ConversationStatus.ERROR } });

      expect(wrapper.find('ChatView').prop('conversationErrorMessage')).toEqual(
        "Sorry! We couldn't connect you with the group. Please refresh and try again."
      );
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
