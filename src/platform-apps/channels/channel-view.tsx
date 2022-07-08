import React from 'react';
import { Message } from '../../store/messages';

export interface Properties {
  name: string;
  messages: Message[];
}

export class ChannelView extends React.Component<Properties> {
  render() {
    return (
      <div className='channel-view'>
        <div className='channel-view__name'>{this.props.name}</div>
      </div>
    );
  }
}
