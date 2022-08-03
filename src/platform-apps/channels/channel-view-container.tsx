import React from 'react';
import { RootState } from '../../store';

import { connectContainer } from '../../store/redux-container';

import { fetch as fetchMessages, Message, MessagesResponse } from '../../store/messages';
import { Channel, denormalize } from '../../store/channels';
import { ChannelView } from './channel-view';
import { MessagesFilter } from '../../store/messages/api';
import { Payload as PayloadFetchMessages } from '../../store/messages/saga';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (payload: PayloadFetchMessages) => void;
}

interface PublicProperties {
  channelId: string;
}

interface State {
  lastCreatedAt: MessagesFilter['lastCreatedAt'];
  hasMoreMessages: MessagesResponse['hasMore'];
  messages: Message[];
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState, props: Properties): Partial<Properties> {
    const channel = denormalize(props.channelId, state) || null;

    return {
      channel,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchMessages,
    };
  }

  state = { lastCreatedAt: null, hasMoreMessages: false, messages: [] };

  componentDidMount() {
    const { channelId } = this.props;

    if (channelId) {
      this.props.fetchMessages({ channelId });
    }
  }

  componentDidUpdate(prevProps: Properties, prevState: State) {
    const { channelId } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.fetchMessages({ channelId, filter: { lastCreatedAt: this.state.lastCreatedAt } });
    }

    if (this.channel?.messages?.length !== prevProps.channel?.messages?.length) {
      this.onMessagesChange();
    }
  }

  get channel(): Channel {
    return this.props.channel || ({} as Channel);
  }

  onMessagesChange(): void {
    const lastMessage = this.channel.messages?.slice(-1)?.[0];
    const lastCreatedAt = lastMessage?.createdAt;

    this.setState({
      lastCreatedAt,
      hasMoreMessages: this.channel?.hasMore,
    });
  }

  onFirstMessageInViewport = (createdAt: Message['createdAt']) => {
    if (createdAt !== this.state.lastCreatedAt) {
      this.setState({ lastCreatedAt: createdAt });

      const { channelId } = this.props;

      this.props.fetchMessages({ channelId, filter: { lastCreatedAt: createdAt } });
    }
  };

  render() {
    if (!this.props.channel) return null;

    return (
      <div>
        <ChannelView
          name={this.channel.name}
          messages={this.channel.messages || []}
          onFirstMessageInViewport={this.onFirstMessageInViewport}
        />
      </div>
    );
  }
}

export const ChannelViewContainer = connectContainer<PublicProperties>(Container);
