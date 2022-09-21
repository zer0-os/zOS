import React from 'react';
import { RootState } from '../../store';

import { connectContainer } from '../../store/redux-container';

import { fetch as fetchMessages, send as sendMessage, Message } from '../../store/messages';
import { Channel, denormalize } from '../../store/channels';
import { ChannelView } from './channel-view';
import { Payload as PayloadFetchMessages, SendPayload as PayloadSendMessage } from '../../store/messages/saga';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (payload: PayloadFetchMessages) => void;
  sendMessage: (payload: PayloadSendMessage) => void;
}

interface PublicProperties {
  channelId: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState, props: PublicProperties): Partial<Properties> {
    const channel = denormalize(props.channelId, state) || null;

    return {
      channel,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchMessages,
      sendMessage,
    };
  }

  componentDidMount() {
    const { channelId } = this.props;

    if (channelId) {
      this.props.fetchMessages({ channelId });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.fetchMessages({ channelId });
    }
  }

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

  handlSendMessage = (message: string): void => {
    const { channelId } = this.props;
    if (channelId) {
      const mentionedUser = 'ef698a51-1cea-42f8-a078-c0f96ed03c9e';

      this.props.sendMessage({ channelId, message, mentionedUser });
    }
  };

  render() {
    if (!this.props.channel) return null;

    return (
      <ChannelView
        name={this.channel.name}
        messages={this.channel.messages || []}
        onFetchMore={this.fetchMore}
        sendMessage={this.handlSendMessage}
      />
    );
  }
}

export const ChannelViewContainer = connectContainer<PublicProperties>(Container);
