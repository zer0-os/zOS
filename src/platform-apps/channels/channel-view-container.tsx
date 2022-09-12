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
  countNewMessage: number;
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

  state = { countNewMessage: 0 };

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

    if (channel && prevProps.channel && channel.messages && prevProps.channel.messages) {
      this.hasMoreMessages(prevProps.channel.messages, channel.messages);
    }
  }

  hasMoreMessages = (prevMessages: Message[], messages: Message[]): void => {
    if (prevMessages.length === messages.length) {
      const prevLastMessage = this.getLastMessage(prevMessages);
      const lastMessage = this.getLastMessage(messages);
      if (lastMessage.createdAt !== prevLastMessage.createdAt) {
        const countNewMessage = this.channel.messages.filter((x) => x.createdAt > prevLastMessage.createdAt).length;
        this.setState({ countNewMessage });
      }
    }
  };

  setCountNewMessage = () => {
    this.setState({ countNewMessage: 0 });
  };

  getOldestTimestamp(messages: Message[] = []): number {
    return messages.reduce((previousTimestamp, message: any) => {
      return message.createdAt < previousTimestamp ? message.createdAt : previousTimestamp;
    }, Date.now());
  }

  getLastMessage(messages: Message[]): Message {
    return messages[Object.keys(messages).pop()];
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
        countNewMessage={this.state.countNewMessage}
        setCountNewMessage={this.setCountNewMessage}
      />
    );
  }
}

export const ChannelViewContainer = connectContainer<PublicProperties>(Container);
