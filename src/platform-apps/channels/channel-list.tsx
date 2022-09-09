import { ZnsLink } from '@zer0-os/zos-component-library';
import classNames from 'classnames';
import React from 'react';

import { Channel } from '../../store/channels';

export interface Properties {
  channels: Channel[];
  currentChannelId: string;
}

export class ChannelList extends React.Component<Properties> {
  renderChannels() {
    return this.props.channels.map((channel) => {
      const className = classNames('channel-list__channel', {
        active: channel.id === this.props.currentChannelId,
      });

      return (
        <ZnsLink
          key={channel.id}
          className={className}
          to={channel.id}
        >
          <span className='channel-list__channel-name-prefix'>#</span>
          <span className='channel-list__channel-name'>{channel.name}</span>
        </ZnsLink>
      );
    });
  }

  render() {
    return <div className='channel-list'>{this.renderChannels()}</div>;
  }
}
