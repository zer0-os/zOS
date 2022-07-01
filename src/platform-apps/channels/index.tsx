import React from 'react';

import { Channel } from '../../store/channels';
import { ChannelList } from './channel-list';

export interface Properties {
  channels: Channel[];
}

export class Channels extends React.Component<Properties> {
  render() {
    return (
      <div className='channels'>
        <ChannelList channels={this.props.channels} />
      </div>
    );
  }
}
