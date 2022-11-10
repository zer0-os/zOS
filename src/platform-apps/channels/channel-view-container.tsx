import React, { RefObject } from 'react';
import classNames from 'classnames';
import { RootState } from '../../store';

import { connectContainer } from '../../store/redux-container';
import {
  fetch as fetchMessages,
  send as sendMessage,
  Message,
  startMessageSync,
  stopSyncChannels,
} from '../../store/messages';
import { Channel, denormalize, loadUsers as fetchUsers } from '../../store/channels';
import { ChannelView } from './channel-view';
import { AuthenticationState } from '../../store/authentication/types';
import { Payload as PayloadFetchMessages, SendPayload as PayloadSendMessage } from '../../store/messages/saga';
import { Payload as PayloadFetchUser } from '../../store/channels-list/saga';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (payload: PayloadFetchMessages) => void;
  user: AuthenticationState['user'];
  sendMessage: (payload: PayloadSendMessage) => void;
  fetchUsers: (payload: PayloadFetchUser) => void;
  startMessageSync: (payload: PayloadFetchMessages) => void;
  stopSyncChannels: (payload: PayloadFetchMessages) => void;
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
      startMessageSync,
      stopSyncChannels,
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
    const { channelId, channel } = this.props;

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

    if (channel && channel.shouldSyncChannels && (!prevProps.channel || !prevProps.channel?.shouldSyncChannels)) {
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

  handlSendMessage = (message: string, mentionedUserIds: string[] = []): void => {
    const { channelId } = this.props;
    if (channelId && this.isNotEmpty(message)) {
      this.props.sendMessage({ channelId, message, mentionedUserIds });
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
      <ChannelView
        className={classNames({ 'channel-view--messages-fetched': this.state.isFirstMessagesFetchDone })}
        name={this.channel.name}
        messages={this.channel.messages || []}
        onFetchMore={this.fetchMore}
        user={this.props.user.data}
        sendMessage={this.handlSendMessage}
        users={this.channel.users || []}
        countNewMessages={this.state.countNewMessages}
        resetCountNewMessage={this.resetCountNewMessage}
        onMessageInputRendered={this.onMessageInputRendered}
      />
    );
  }
}

export const ChannelViewContainer = connectContainer<PublicProperties>(Container);
