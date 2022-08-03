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

export class Container extends React.Component<Properties> {
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

  get channel(): Channel {
    return this.props.channel || ({} as Channel);
  }

  onFirstMessageInViewport = (createdAt: Message['createdAt']) => {
    const { channelId } = this.props;

    this.props.fetchMessages({ channelId, filter: { lastCreatedAt: createdAt } });
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
