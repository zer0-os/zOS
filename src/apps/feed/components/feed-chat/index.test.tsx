import { shallow } from 'enzyme';
import { Container as FeedChatContainer } from './index';
import { ChatViewContainer } from '../../../../components/chat-view-container/chat-view-container';
import { MessageInput } from '../../../../components/message-input/container';
import { RootState } from '../../../../store/reducer';

describe('FeedChatContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      zid: undefined,
      channel: null,
      activeConversationId: null,
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

    expect(validateFeedChat).toHaveBeenCalledWith('test-zid:zero-synapse-development.zer0.io');
  });

  it('calls validateFeedChat when zid prop changes', () => {
    const validateFeedChat = jest.fn();
    const wrapper = subject({
      zid: 'test-zid',
      validateFeedChat,
    });

    wrapper.setProps({ zid: 'new-zid' });

    expect(validateFeedChat).toHaveBeenLastCalledWith('new-zid:zero-synapse-development.zer0.io');
  });

  describe('mapState', () => {
    const getState = (state: any) =>
      ({
        normalized: {
          ...(state.normalized || {}),
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
});
