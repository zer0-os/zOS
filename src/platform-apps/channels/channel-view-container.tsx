import React from 'react';
import { RootState } from '../../store';

import { connectContainer } from '../../store/redux-container';

import { fetch as fetchMessages } from '../../store/messages';
import { Channel, denormalize } from '../../store/channels';
import { ChannelView } from './channel-view';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (channelId: string) => void;
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
    };
  }

  componentDidMount() {
    const { channelId } = this.props;

    if (channelId) {
      this.props.fetchMessages(channelId);
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.fetchMessages(channelId);
    }
  }

  get channel(): Channel {
    return this.props.channel || ({} as Channel);
  }

  render() {
    if (!this.props.channel) return null;

    return (
      <ChannelView
        name={this.channel.name}
        messages={this.channel.messages || []}
      />
    );
  }
}

export const ChannelViewContainer = connectContainer<PublicProperties>(Container);
