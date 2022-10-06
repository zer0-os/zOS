import React from 'react';
import { RootState } from '../../store';

import { connectContainer } from '../../store/redux-container';
import {
  fetch as fetchMessages,
  send as sendMessage,
  Message,
  startMessageSync,
  stopSyncChannels,
} from '../../store/messages';
import { fetch as fetchUsers, UserMentions } from '../../store/users';
import { Channel, denormalize } from '../../store/channels';
import { ChannelView } from './channel-view';
import { AuthenticationState } from '../../store/authentication/types';
import { Payload as PayloadFetchMessages, SendPayload as PayloadSendMessage } from '../../store/messages/saga';
import { FetchUsersPayload } from '../../store/users/saga';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (payload: PayloadFetchMessages) => void;
  user: AuthenticationState['user'];
  sendMessage: (payload: PayloadSendMessage) => void;
  fetchUsers: (payload: FetchUsersPayload) => void;
  startMessageSync: (payload: PayloadFetchMessages) => void;
  stopSyncChannels: (payload: PayloadFetchMessages) => void;
  users: UserMentions[];
}

interface PublicProperties {
  channelId: string;
}
export interface State {
  countNewMessages: number;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState, props: PublicProperties): Partial<Properties> {
    const channel = denormalize(props.channelId, state) || null;
    const {
      authentication: { user },
      users: { users },
    } = state;

    return {
      channel,
      user,
      users,
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

  state = { countNewMessages: 0 };

  componentDidMount() {
    const { channelId } = this.props;

    if (channelId) {
      this.props.fetchMessages({ channelId });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId, channel } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.stopSyncChannels(prevProps);
      this.props.fetchMessages({ channelId });
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

  isValidPost = (message: string): boolean => {
    return !!message && message.trim() !== '';
  };

  handlSendMessage = (message: string, mentionedUsers: string[] = []): void => {
    const { channelId } = this.props;
    if (channelId && this.isValidPost(message)) {
      this.props.sendMessage({ channelId, message, mentionedUsers });
    }
  };

  handlFetchUsers = (payload: FetchUsersPayload): void => {
    this.props.fetchUsers(payload);
  };

  render() {
    if (!this.props.channel) return null;

    return (
      <ChannelView
        name={this.channel.name}
        messages={this.channel.messages || []}
        onFetchMore={this.fetchMore}
        user={this.props.user.data}
        sendMessage={this.handlSendMessage}
        fetchUsers={this.handlFetchUsers}
        users={this.props.users}
        countNewMessages={this.state.countNewMessages}
        resetCountNewMessage={this.resetCountNewMessage}
      />
    );
  }
}

export const ChannelViewContainer = connectContainer<PublicProperties>(Container);
