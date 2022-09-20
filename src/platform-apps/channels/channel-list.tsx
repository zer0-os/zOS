import { ZnsLink } from '@zer0-os/zos-component-library';
import React from 'react';
import Collapsible from 'react-collapsible';

import { Channel } from '../../store/channels';

export interface Properties {
  channels: Channel[];
  currentChannelId: string;
}

interface ChannelsCategory {
  channels: Channel[];
}

export class ChannelList extends React.Component<Properties> {
  category(channels: Channel[]): ChannelsCategory[] {
    return channels.reduce(function (r, a) {
      const category = a.category || '#';
      r[category] = r[category] || [];
      r[category].push(a);
      return r;
    }, Object.create(null));
  }

  renderChannels(channels: Channel[]) {
    return (
      <div className='channel-list__category-channel-list'>
        {channels.map((channel) => {
          return (
            <ZnsLink
              key={channel.id}
              className='channel-list__channel'
              to={channel.id}
            >
              <span className='channel-list__channel-name-prefix'>#</span>
              <span className='channel-list__channel-name'>{channel.name}</span>
            </ZnsLink>
          );
        })}
      </div>
    );
  }

  renderCategory() {
    const { channels } = this.props;
    const channelsByCategory: ChannelsCategory[] = this.category(channels);

    return (
      <div className='channel-list__category'>
        {Object.keys(channelsByCategory).map((category) => {
          return (
            <div
              key={category}
              className='channel-list__category-channel'
            >
              <Collapsible
                className='channel-list__category-channel-name'
                openedClassName='channel-list__category-channel-name'
                classParentString='collapsible'
                trigger={category}
                open
              >
                {this.renderChannels(channelsByCategory[category])}
              </Collapsible>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return <div className='channel-list'>{this.props.channels.length > 0 && this.renderCategory()}</div>;
  }
}
