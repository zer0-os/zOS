import { ZnsLink } from '@zer0-os/zos-component-library';
import React from 'react';

import { Channel } from '../../store/channels';

export interface Properties {
  channels: Channel[];
}

export class ChannelList extends React.Component<Properties> {
  render() {
    return (
      <div className='channel-list'>
        {this.props.channels.map((channel) => {
          return (
            <ZnsLink
              key={channel.id}
              className='channel-list__channel'
              to={channel.id}
            >
              <span className='channel-list__channel-name'>{channel.name}</span>
            </ZnsLink>
          );
        })}
      </div>
    );
  }
}
