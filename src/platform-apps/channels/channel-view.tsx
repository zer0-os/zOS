import React from 'react';

export interface Properties {
  name: string;
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
