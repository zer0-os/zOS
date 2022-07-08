import React from 'react';
import { RootState } from '../../store';

import { connectContainer } from '../../store/redux-container';

import { Channel, denormalize } from '../../store/channels';
import { ChannelView } from './channel-view';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchChannel: (channelId: string) => void;
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
    if (this.props.channelId) {
      this.props.fetchChannel(this.props.channelId);
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.fetchChannel(channelId);
    }
  }

  render() {
    if (!this.props.channel) return null;

    return <ChannelView name={this.props.channel.name} />;
  }
}

export const ChannelViewContainer = connectContainer<PublicProperties>(Container);
