import React from 'react';
import { RootState } from '../../store';

import { connectContainer } from '../../store/redux-container';

import { fetch as fetchMessages, Message } from '../../store/messages';
import { Channel, denormalize } from '../../store/channels';
import { ChannelView } from './channel-view';
import { Payload as PayloadFetchMessages } from '../../store/messages/saga';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (payload: PayloadFetchMessages) => void;
}

interface PublicProperties {
  channelId: string;
}
export interface State {
  hasNewMessages: number;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState, props: PublicProperties): Partial<Properties> {
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

  state = { hasNewMessages: 0 };

  componentDidMount() {
    const { channelId } = this.props;
    if (channelId) {
      this.props.fetchMessages({ channelId });
      setInterval(() => {
        this.props.fetchMessages({ channelId });
      }, 20000);
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId, channel } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.fetchMessages({ channelId });
    }

    if (channel && prevProps.channel && prevProps.channel.messages && channel.messages) {
      this.hasMoreMessages(prevProps.channel.messages.length);
    }
  }

  hasMoreMessages = (countMessages: number) => {
    if (this.channel.messages.length > countMessages) {
      this.setState({ hasNewMessages: this.channel.messages.length - countMessages });
    }
  };

  closeIndicator = () => {
    this.setState({ hasNewMessages: 0 });
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

  render() {
    if (!this.props.channel) return null;

    return (
      <ChannelView
        name={this.channel.name}
        messages={this.channel.messages || []}
        onFetchMore={this.fetchMore}
        hasNewMessage={this.state.hasNewMessages}
        closeIndicator={this.closeIndicator}
      />
    );
  }
}

export const ChannelViewContainer = connectContainer<PublicProperties>(Container);
