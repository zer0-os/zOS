import { RootState } from '../../store/reducer';

import { shallow } from 'enzyme';

import { Container } from './chat-view-container';
import { ChatView } from './chat-view';
import { Message } from '../../store/messages';
import { ConversationStatus } from '../../store/channels';

describe('ChannelViewContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      channel: null,
      channelId: '',
      fetchMessages: () => undefined,
      user: {
        isLoading: false,
        data: null,
      },
      activeConversationId: '',
      sendMessage: () => undefined,
      uploadFileMessage: () => undefined,
      openDeleteMessage: () => undefined,
      loadAttachmentDetails: () => undefined,
      openReportUserModal: () => undefined,
      editMessage: () => undefined,
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
      { id: 'message-child', rootMessageId: 'message-root', media: { id: '1', media: 'media' } },
    ];

    const wrapper = subject({ channel: { messages } });

    expect(wrapper.find(ChatView).prop('messages')).toStrictEqual([
      { ...messages[0], media: { id: '1', media: 'media' } },
      messages[1],
    ]);
  });

  it('groups message media with optimistic rootId onto parent message', () => {
    const messages = [
      { id: 'message-root', optimisticId: 'optimistic-message-root', rootMessageId: '' },
      { id: 'message-two', rootMessageId: '' },
      { id: 'message-child', rootMessageId: 'optimistic-message-root', media: { id: '1', media: 'media' } },
    ];

    const wrapper = subject({ channel: { messages } });

    expect(wrapper.find(ChatView).prop('messages')).toStrictEqual([
      { ...messages[0], media: { id: '1', media: 'media' } },
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

  it('fetches messages on mount', () => {
    const fetchMessages = jest.fn();

    subject({ fetchMessages, channelId: 'the-channel-id', channel: { hasLoadedMessages: false } });

    expect(fetchMessages).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('fetches messages when channel id is set', () => {
    const fetchMessages = jest.fn();

    const wrapper = subject({
      fetchMessages,
      channelId: '',
      channel: { name: 'first channel', shouldSyncChannels: false },
    });

    wrapper.setProps({ channelId: 'the-channel-id' });

    expect(fetchMessages).toHaveBeenCalledWith({ channelId: 'the-channel-id' });
  });

  it('fetches messages when channel id is updated', () => {
    const fetchMessages = jest.fn();

    const wrapper = subject({
      fetchMessages,
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

  it('should call openDeleteMessage', () => {
    const openDeleteMessage = jest.fn();
    const messageId = 2345221;

    const wrapper = subject({
      openDeleteMessage,
      channelId: 'the-channel-id',
      channel: { hasMore: true, name: 'first channel' },
    });

    wrapper.find(ChatView).first().prop('deleteMessage')(messageId);

    expect(openDeleteMessage).toHaveBeenCalledWith(messageId);
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
        groupManagement: {
          isSecondarySidekickOpen: false,
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
