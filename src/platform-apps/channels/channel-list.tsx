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
            <div
              key={channel.id}
              className='channel-list__channel'
            >
              {channel.name}
            </div>
          );
        })}
      </div>
    );
  }
}
