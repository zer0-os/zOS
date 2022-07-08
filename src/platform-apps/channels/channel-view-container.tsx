import React from 'react';
import { RootState } from '../../store';

import { connectContainer } from '../../store/redux-container';

import { Channel, denormalize } from '../../store/channels';
import { ChannelView } from './channel-view';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchChannel: (channelId: string) => void;
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
    return {};
  }

  componentDidMount() {
    const { channelId } = this.props;

    if (channelId) {
      this.loadData(channelId);
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.loadData(channelId);
    }
  }

  get channel(): Channel {
    return this.props.channel || ({} as Channel);
  }

  loadData(channelId: string) {
    if (channelId !== this.channel.id) {
      this.props.fetchChannel(channelId);
    }

    this.props.fetchMessages(channelId);
  }

  render() {
    if (!this.props.channel) return null;

    return <ChannelView name={this.channel.name} />;
  }
}

export const ChannelViewContainer = connectContainer<PublicProperties>(Container);
