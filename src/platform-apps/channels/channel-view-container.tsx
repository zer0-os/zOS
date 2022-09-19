import React from 'react';
import { RootState } from '../../store';

import { connectContainer } from '../../store/redux-container';

import { fetch as fetchMessages, Message, startMessageSync } from '../../store/messages';
import { Channel, denormalize } from '../../store/channels';
import { ChannelView } from './channel-view';
import { Payload as PayloadFetchMessages } from '../../store/messages/saga';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (payload: PayloadFetchMessages) => void;
  startMessageSync: (payload: PayloadFetchMessages) => void;
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

    return {
      channel,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchMessages,
      startMessageSync,
    };
  }

  state = { countNewMessages: 0 };

  componentDidMount() {
    const { channelId } = this.props;

    if (channelId) {
      this.props.fetchMessages({ channelId });
      this.props.startMessageSync({ channelId });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId, channel } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.fetchMessages({ channelId });
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

  render() {
    if (!this.props.channel) return null;

    return (
      <ChannelView
        name={this.channel.name}
        messages={this.channel.messages || []}
        onFetchMore={this.fetchMore}
        countNewMessages={this.state.countNewMessages}
        resetCountNewMessage={this.resetCountNewMessage}
      />
    );
  }
}

export const ChannelViewContainer = connectContainer<PublicProperties>(Container);
