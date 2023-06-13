import React, { RefObject } from 'react';
import classNames from 'classnames';
import { RootState } from '../../store/reducer';

import { connectContainer } from '../../store/redux-container';
import {
  fetch as fetchMessages,
  send as sendMessage,
  uploadFileMessage,
  deleteMessage,
  editMessage,
  Message,
  startMessageSync,
  stopSyncChannels,
  EditMessageOptions,
} from '../../store/messages';
import { Channel, denormalize, joinChannel, markAllMessagesAsReadInChannel } from '../../store/channels';
import { ChatView } from './chat-view';
import { AuthenticationState } from '../../store/authentication/types';
import {
  EditPayload,
  Payload as PayloadFetchMessages,
  SendPayload as PayloadSendMessage,
  MediaPayload,
} from '../../store/messages/saga';
import { Payload as PayloadJoinChannel, MarkAsReadPayload } from '../../store/channels/types';
import { withContext as withAuthenticationContext } from '../authentication/context';
import { Media } from '../message-input/utils';
import { ParentMessage } from '../../lib/chat/types';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (payload: PayloadFetchMessages) => void;
  user: AuthenticationState['user'];
  sendMessage: (payload: PayloadSendMessage) => void;
  uploadFileMessage: (payload: MediaPayload) => void;
  deleteMessage: (payload: PayloadFetchMessages) => void;
  editMessage: (payload: EditPayload) => void;
  joinChannel: (payload: PayloadJoinChannel) => void;
  markAllMessagesAsReadInChannel: (payload: MarkAsReadPayload) => void;
  startMessageSync: (payload: PayloadFetchMessages) => void;
  stopSyncChannels: (payload: PayloadFetchMessages) => void;
  activeConversationId?: string;
  context: {
    isAuthenticated: boolean;
  };
}

interface PublicProperties {
  channelId: string;
  className?: string;
  isDirectMessage?: boolean;
  showSenderAvatar?: boolean;
}
export interface State {
  countNewMessages: number;
  isFirstMessagesFetchDone: boolean;
  reply: null | ParentMessage;
}

export class Container extends React.Component<Properties, State> {
  private textareaRef: RefObject<HTMLTextAreaElement>;

  static mapState(state: RootState, props: PublicProperties): Partial<Properties> {
    const channel = denormalize(props.channelId, state) || null;
    const {
      authentication: { user },
      chat: { activeConversationId },
    } = state;

    return {
      channel,
      user,
      activeConversationId,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchMessages,
      sendMessage,
      uploadFileMessage,
      startMessageSync,
      stopSyncChannels,
      deleteMessage,
      joinChannel,
      markAllMessagesAsReadInChannel,
      editMessage,
    };
  }

  state = { countNewMessages: 0, isFirstMessagesFetchDone: false, reply: null };

  componentDidMount() {
    const { channelId } = this.props;
    if (channelId) {
      this.props.fetchMessages({ channelId });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId, channel, user } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.stopSyncChannels(prevProps);
      this.props.fetchMessages({ channelId });
      this.setState({
        isFirstMessagesFetchDone: false,
        reply: null,
      });
    }

    if (
      channelId &&
      this.props.user.isLoading === false &&
      prevProps.user.data === null &&
      this.props.user.data !== null
    ) {
      this.props.fetchMessages({ channelId });
      this.setState({
        isFirstMessagesFetchDone: false,
      });
    }

    if (
      !this.props.context.isAuthenticated &&
      channel &&
      channel.shouldSyncChannels &&
      (!prevProps.channel || !prevProps.channel?.shouldSyncChannels)
    ) {
      this.props.startMessageSync({ channelId });
    }

    if (
      channel &&
      channel.countNewMessages &&
      prevProps.channel.countNewMessages !== channel.countNewMessages &&
      channel.countNewMessages > 0
    ) {
      this.setState({ countNewMessages: channel.countNewMessages });
    }

    if (!this.state.isFirstMessagesFetchDone && channel && Boolean(channel.messages)) {
      this.setState({
        isFirstMessagesFetchDone: true,
      });
    }

    if (this.state.isFirstMessagesFetchDone && channel && channel.unreadCount > 0 && user.data) {
      this.props.markAllMessagesAsReadInChannel({ channelId, userId: user.data.id });
    }

    if (this.state.isFirstMessagesFetchDone && this.textareaRef && channel && Boolean(channel.messages)) {
      this.onMessageInputRendered(this.textareaRef);
      this.textareaRef = null;
    }
  }

  componentWillUnmount() {
    const { channelId } = this.props;
    this.props.stopSyncChannels({ channelId });
  }

  resetCountNewMessage = () => {
    this.setState({ countNewMessages: 0 });
  };

  getOldestTimestamp(messages: Message[] = []): number {
    return messages.reduce((previousTimestamp, message: any) => {
      return message.createdAt < previousTimestamp ? message.createdAt : previousTimestamp;
    }, Date.now());
  }

  get channel(): Channel {
    return this.props.channel || ({} as Channel);
  }

  fetchMore = (): void => {
    const { channelId, channel } = this.props;

    if (channel.hasMore) {
      const referenceTimestamp = this.getOldestTimestamp(channel.messages);

      this.props.fetchMessages({ channelId, referenceTimestamp });
    }
  };

  isNotEmpty = (message: string): boolean => {
    return !!message && message.trim() !== '';
  };

  handleSendMessage = (message: string, mentionedUserIds: string[] = [], media: Media[] = []): void => {
    const { channelId } = this.props;
    if (channelId && this.isNotEmpty(message)) {
      let payloadSendMessage: PayloadSendMessage = { channelId, message, mentionedUserIds };
      if (this.state.reply) {
        payloadSendMessage.parentMessage = this.state.reply;
      }

      this.props.sendMessage(payloadSendMessage);
      this.removeReply();
    }

    if (channelId && media.length) {
      this.props.uploadFileMessage({ channelId, media });
    }
  };

  onReply = (reply: ParentMessage) => {
    this.setState({ reply });
  };

  removeReply = (): void => {
    this.setState({ reply: null });
  };

  handleDeleteMessage = (messageId: number): void => {
    const { channelId } = this.props;
    if (channelId && messageId) {
      this.props.deleteMessage({ channelId, messageId });
    }
  };

  handleEditMessage = (
    messageId: number,
    message: string,
    mentionedUserIds: string[],
    data?: Partial<EditMessageOptions>
  ): void => {
    const { channelId } = this.props;
    if (channelId && messageId) {
      this.props.editMessage({ channelId, messageId, message, mentionedUserIds, data });
    }
  };

  handleJoinChannel = (): void => {
    const { channelId } = this.props;
    if (channelId) {
      this.props.joinChannel({ channelId });
    }
  };

  onMessageInputRendered = (textareaRef: RefObject<HTMLTextAreaElement>) => {
    if (textareaRef && textareaRef.current) {
      if (!this.textareaRef) this.textareaRef = textareaRef;
      if (
        (this.props.activeConversationId && this.props.activeConversationId === textareaRef.current.id) ||
        !this.props.activeConversationId
      ) {
        textareaRef.current.focus();
      }
    }
  };

  render() {
    if (!this.props.channel) return null;

    return (
      <>
        <ChatView
          className={classNames(
            { 'channel-view--messages-fetched': this.state.isFirstMessagesFetchDone },
            this.props.className
          )}
          id={this.channel.id}
          name={this.channel.name}
          messages={this.channel.messages || []}
          onFetchMore={this.fetchMore}
          user={this.props.user.data}
          deleteMessage={this.handleDeleteMessage}
          editMessage={this.handleEditMessage}
          sendMessage={this.handleSendMessage}
          joinChannel={this.handleJoinChannel}
          hasJoined={this.channel.hasJoined || this.props.isDirectMessage}
          countNewMessages={this.state.countNewMessages}
          resetCountNewMessage={this.resetCountNewMessage}
          onMessageInputRendered={this.onMessageInputRendered}
          isDirectMessage={this.props.isDirectMessage}
          showSenderAvatar={this.props.showSenderAvatar}
          reply={this.state.reply}
          onReply={this.onReply}
          onRemove={this.removeReply}
        />
      </>
    );
  }
}

export const ChatViewContainer = withAuthenticationContext<PublicProperties>(
  connectContainer<PublicProperties>(Container)
);
