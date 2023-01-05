import React, { RefObject } from 'react';
import classNames from 'classnames';
import { RootState } from '../../store';

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
} from '../../store/messages';
import {
  Channel,
  denormalize,
  loadUsers as fetchUsers,
  joinChannel,
  markAllMessagesAsReadInChannel,
} from '../../store/channels';
import { ChannelView } from './channel-view';
import { AuthenticationState } from '../../store/authentication/types';
import {
  EditPayload,
  Payload as PayloadFetchMessages,
  SendPayload as PayloadSendMessage,
  MediaPyload,
} from '../../store/messages/saga';
import { Payload as PayloadFetchUser } from '../../store/channels-list/saga';
import { Payload as PayloadJoinChannel, MarkAsReadPayload } from '../../store/channels/saga';
import { ChatConnect } from './chat-connect/chat-connect';
import { IfAuthenticated } from '../../components/authentication/if-authenticated';
import { withContext as withAuthenticationContext } from '../../components/authentication/context';
import { Media } from '../../components/message-input/utils';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (payload: PayloadFetchMessages) => void;
  user: AuthenticationState['user'];
  sendMessage: (payload: PayloadSendMessage) => void;
  uploadFileMessage: (payload: MediaPyload) => void;
  deleteMessage: (payload: PayloadFetchMessages) => void;
  editMessage: (payload: EditPayload) => void;
  fetchUsers: (payload: PayloadFetchUser) => void;
  joinChannel: (payload: PayloadJoinChannel) => void;
  markAllMessagesAsReadInChannel: (payload: MarkAsReadPayload) => void;
  startMessageSync: (payload: PayloadFetchMessages) => void;
  stopSyncChannels: (payload: PayloadFetchMessages) => void;
  context: {
    isAuthenticated: boolean;
  };
}

interface PublicProperties {
  channelId: string;
}
export interface State {
  countNewMessages: number;
  isFirstMessagesFetchDone: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState, props: PublicProperties): Partial<Properties> {
    const channel = denormalize(props.channelId, state) || null;
    const {
      authentication: { user },
    } = state;

    return {
      channel,
      user,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchMessages,
      fetchUsers,
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

  state = { countNewMessages: 0, isFirstMessagesFetchDone: false };

  componentDidMount() {
    const { channelId } = this.props;
    if (channelId) {
      this.props.fetchMessages({ channelId });
      this.props.fetchUsers({ channelId });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId, channel, user } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.stopSyncChannels(prevProps);
      this.props.fetchMessages({ channelId });
      this.props.fetchUsers({ channelId });
      this.setState({
        isFirstMessagesFetchDone: false,
      });
    }

    if (
      channelId &&
      this.props.user.isLoading === false &&
      prevProps.user.data === null &&
      this.props.user.data !== null
    ) {
      this.props.fetchMessages({ channelId });
      this.props.fetchUsers({ channelId });
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

    // mark all messages as "read" after channel load/join
    if (this.state.isFirstMessagesFetchDone && channel && channel.unreadCount > 0 && user.data) {
      this.props.markAllMessagesAsReadInChannel({ channelId, userId: user.data.id });
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
      this.props.sendMessage({ channelId, message, mentionedUserIds });
    }

    if (channelId && media.length) {
      this.props.uploadFileMessage({ channelId, media });
    }
  };

  handleDeleteMessage = (messageId: number): void => {
    const { channelId } = this.props;
    if (channelId && messageId) {
      this.props.deleteMessage({ channelId, messageId });
    }
  };

  handleEditMessage = (messageId: number, message: string, mentionedUserIds: string[]): void => {
    const { channelId } = this.props;
    if (channelId && messageId) {
      this.props.editMessage({ channelId, messageId, message, mentionedUserIds });
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
      textareaRef.current.focus();
    }
  };

  render() {
    if (!this.props.channel) return null;

    return (
      <>
        <IfAuthenticated showChildren>
          <ChatConnect />
        </IfAuthenticated>
        <ChannelView
          className={classNames({ 'channel-view--messages-fetched': this.state.isFirstMessagesFetchDone })}
          name={this.channel.name}
          messages={this.channel.messages || []}
          onFetchMore={this.fetchMore}
          user={this.props.user.data}
          deleteMessage={this.handleDeleteMessage}
          editMessage={this.handleEditMessage}
          sendMessage={this.handleSendMessage}
          joinChannel={this.handleJoinChannel}
          users={this.channel.users || []}
          hasJoined={this.channel.hasJoined || false}
          countNewMessages={this.state.countNewMessages}
          resetCountNewMessage={this.resetCountNewMessage}
          onMessageInputRendered={this.onMessageInputRendered}
        />
      </>
    );
  }
}

export const ChannelViewContainer = withAuthenticationContext<PublicProperties>(
  connectContainer<PublicProperties>(Container)
);
