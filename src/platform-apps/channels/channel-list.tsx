import { ZnsLink } from '@zer0-os/zos-component-library';
import classNames from 'classnames';
import React from 'react';
import Collapsible from 'react-collapsible';

import { Channel, GroupChannelType } from '../../store/channels';

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
          const { unreadCount } = channel;

          let unreadCountLabel = unreadCount + '';
          if (unreadCount > 9) {
            unreadCountLabel = '9+';
          }

          return (
            <div key={channel.id} className='channel-list__channel-info'>
              <ZnsLink
                className={classNames('channel-list__channel', {
                  active: channel.id === this.props.currentChannelId,
                })}
                to={channel.id}
              >
                <span className='channel-list__channel-name-prefix'>#</span>
                <span className='channel-list__channel-name'>{channel.name}</span>
                {unreadCount > 0 && <span className='channel-list__channel-unread-count'>{unreadCountLabel}</span>}
                {channel.groupChannelType === GroupChannelType.Private && (
                  <span className='channel-list__channel-private-icon'>{this.lockIcon()}</span>
                )}
              </ZnsLink>
            </div>
          );
        })}
      </div>
    );
  }

  lockIcon() {
    return (
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='channel-list__private-icon'
      >
        <path
          d='M17 10V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V10M12 14.5V16.5M8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C17.7202 10 16.8802 10 15.2 10H8.8C7.11984 10 6.27976 10 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21Z'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    );
  }

  renderCategory() {
    const { channels } = this.props;
    const channelsByCategory: ChannelsCategory[] = this.category(channels);

    return (
      <div className='channel-list__category'>
        {Object.keys(channelsByCategory).map((category) => {
          return (
            <div key={category} className='channel-list__category-channel'>
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
