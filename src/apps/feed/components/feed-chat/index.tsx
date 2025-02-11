import React from 'react';
import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { ChatViewContainer } from '../../../../components/chat-view-container/chat-view-container';
import { validateFeedChat } from '../../../../store/chat';
import { Channel, denormalize } from '../../../../store/channels';
import { MessageInput } from '../../../../components/message-input/container';
import { send as sendMessage } from '../../../../store/messages';
import { SendPayload as PayloadSendMessage } from '../../../../store/messages/saga';
import { searchMentionableUsersForChannel } from '../../../../platform-apps/channels/util/api';
import { Media } from '../../../../components/message-input/utils';

interface Properties {
  zid?: string;
  channel: Channel | null;
  activeConversationId: string | null;
  validateFeedChat: (id: string) => void;
  sendMessage: (payload: PayloadSendMessage) => void;
}

export class Container extends React.Component<Properties> {
  chatViewContainerRef = null;

  constructor(props: Properties) {
    super(props);
    this.chatViewContainerRef = React.createRef();
  }

  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId },
    } = state;

    const channel = denormalize(activeConversationId, state) || null;

    return {
      channel,
      activeConversationId,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      validateFeedChat: (id: string) => validateFeedChat({ id }),
      sendMessage,
    };
  }

  componentDidMount(): void {
    if (this.props.zid) {
      // replace with dev and prod env var domains (add to config)
      const roomAlias = `${this.props.zid}:zero-synapse-development.zer0.io`;
      this.props.validateFeedChat(roomAlias);
    }
  }

  componentDidUpdate(prevProps: Properties): void {
    if (this.props.zid !== prevProps.zid) {
      if (this.props.zid) {
        // replace with dev and prod env var domains (add to config)
        const roomAlias = `${this.props.zid}:zero-synapse-development.zer0.io`;
        this.props.validateFeedChat(roomAlias);
      }
    }
  }

  handleSendMessage = (message: string, mentionedUserIds: string[] = [], media: Media[] = []): void => {
    const { activeConversationId } = this.props;

    const payloadSendMessage = {
      channelId: activeConversationId,
      message,
      mentionedUserIds,
      files: media,
    };

    this.props.sendMessage(payloadSendMessage);

    if (this.chatViewContainerRef?.current) {
      this.chatViewContainerRef.current.scrollToBottom();
    }
  };

  searchMentionableUsers = async (search: string) => {
    return await searchMentionableUsersForChannel(
      this.props.activeConversationId,
      search,
      this.props.channel.otherMembers
    );
  };

  render() {
    if (!this.props.zid || !this.props.channel || !this.props.activeConversationId) {
      return null;
    }

    return (
      <div>
        <ChatViewContainer
          channelId={this.props.activeConversationId}
          showSenderAvatar={true}
          ref={this.chatViewContainerRef}
        />
        <div>
          <MessageInput
            id={this.props.activeConversationId}
            onSubmit={this.handleSendMessage}
            getUsersForMentions={this.searchMentionableUsers}
          />
        </div>
      </div>
    );
  }
}

export const FeedChatContainer = connectContainer<{ zid?: string }>(Container);
