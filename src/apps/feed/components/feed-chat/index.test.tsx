import { shallow } from 'enzyme';
import { Container as FeedChatContainer } from './index';
import { ChatViewContainer } from '../../../../components/chat-view-container/chat-view-container';
import { MessageInput } from '../../../../components/message-input/container';
import { RootState } from '../../../../store/reducer';
import { validateFeedChat } from '../../../../store/chat';
import { send } from '../../../../store/messages';
import { config } from '../../../../config';

describe('FeedChatContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      zid: undefined,
      channel: null,
      activeConversationId: null,
      isJoiningConversation: false,
      isConversationsLoaded: true,
      joinRoomErrorContent: null,
      validateFeedChat: () => undefined,
      sendMessage: () => undefined,
      ...props,
    };

    return shallow(<FeedChatContainer {...allProps} />);
  };

  it('does not render child components if zid is not provided', () => {
    const wrapper = subject();

    expect(wrapper.find(ChatViewContainer).exists()).toStrictEqual(false);
    expect(wrapper.find(MessageInput).exists()).toStrictEqual(false);
  });

  it('does not render child components if channel is not loaded', () => {
    const wrapper = subject({ zid: 'test-zid', channel: null });

    expect(wrapper.find(ChatViewContainer).exists()).toStrictEqual(false);
    expect(wrapper.find(MessageInput).exists()).toStrictEqual(false);
  });

  it('does not render child components if activeConversationId is not set', () => {
    const wrapper = subject({
      zid: 'test-zid',
      channel: { id: 'channel-id' },
      activeConversationId: null,
    });

    expect(wrapper.find(ChatViewContainer).exists()).toStrictEqual(false);
    expect(wrapper.find(MessageInput).exists()).toStrictEqual(false);
  });

  it('does not render child components when isJoiningConversation is true', () => {
    const wrapper = subject({
      zid: 'test-zid',
      channel: { id: 'channel-id' },
      activeConversationId: 'conversation-id',
      isJoiningConversation: true,
    });

    expect(wrapper.find(ChatViewContainer).exists()).toStrictEqual(false);
    expect(wrapper.find(MessageInput).exists()).toStrictEqual(false);
  });

  it('does not render child components when isConversationsLoaded is false', () => {
    const wrapper = subject({
      zid: 'test-zid',
      channel: { id: 'channel-id' },
      activeConversationId: 'conversation-id',
      isConversationsLoaded: false,
    });

    expect(wrapper.find(ChatViewContainer).exists()).toStrictEqual(false);
    expect(wrapper.find(MessageInput).exists()).toStrictEqual(false);
  });

  it('does not render child components when joinRoomErrorContent is present', () => {
    const wrapper = subject({
      zid: 'test-zid',
      channel: { id: 'channel-id' },
      activeConversationId: 'conversation-id',
      joinRoomErrorContent: {
        header: 'Error',
        body: 'Access denied',
      },
    });

    expect(wrapper.find(ChatViewContainer).exists()).toStrictEqual(false);
    expect(wrapper.find(MessageInput).exists()).toStrictEqual(false);
  });

  it('renders child components when all required props are provided', () => {
    const wrapper = subject({
      zid: 'test-zid',
      channel: { id: 'channel-id' },
      activeConversationId: 'conversation-id',
    });

    expect(wrapper.find(ChatViewContainer).exists()).toStrictEqual(true);
    expect(wrapper.find(MessageInput).exists()).toStrictEqual(true);
  });

  it('calls validateFeedChat on mount when zid is provided', () => {
    const validateFeedChat = jest.fn();

    subject({
      zid: 'test-zid',
      validateFeedChat,
    });

    expect(validateFeedChat).toHaveBeenCalledWith(`test-zid:${config.matrixHomeServerName}`);
  });

  it('calls validateFeedChat when zid prop changes', () => {
    const validateFeedChat = jest.fn();
    const wrapper = subject({
      zid: 'test-zid',
      validateFeedChat,
    });

    wrapper.setProps({ zid: 'new-zid' });

    expect(validateFeedChat).toHaveBeenLastCalledWith(`new-zid:${config.matrixHomeServerName}`);
  });

  describe('mapState', () => {
    const getState = (state: any) =>
      ({
        normalized: {
          ...(state.normalized || {}),
        },
        groupManagement: {
          ...(state.groupManagement || {}),
        },
        chat: {
          activeConversationId: '1',
        },
      } as RootState);

    test('channel and activeConversationId', () => {
      const state = getState({
        normalized: {
          channels: {
            '1': { id: '1', name: 'test channel' },
          },
        },
      });

      const props = FeedChatContainer.mapState(state);

      expect(props.channel).toMatchObject({
        id: '1',
        name: 'test channel',
      });
      expect(props.activeConversationId).toBe('1');
    });
  });

  describe('mapActions', () => {
    it('maps validateFeedChat and sendMessage actions', () => {
      const actions = FeedChatContainer.mapActions();

      expect(actions.validateFeedChat).toBeDefined();
      expect(actions.sendMessage).toBeDefined();
    });

    it('maps validateFeedChat to dispatch validateFeedChat action', () => {
      const actions = FeedChatContainer.mapActions();
      const id = 'test-id';

      expect(actions.validateFeedChat(id)).toEqual(validateFeedChat({ id }));
    });

    it('maps sendMessage to dispatch send action', () => {
      const actions = FeedChatContainer.mapActions();
      const payload = {
        channelId: 'channel-id',
        message: 'test message',
        mentionedUserIds: [],
        files: [],
      };

      expect(actions.sendMessage(payload)).toEqual(send(payload));
    });
  });
});
