import React from 'react';

import './styles.scss';

export interface Properties {
  onForceReconnect: () => void;
}

export class StatusIndicator extends React.Component<Properties> {
  render() {
    return (
      <div className='status-indicator'>
        <span className='status-indicator__message'>Connection lost, calling the stars...</span>
        <button className='status-indicator__reconnect-button' onClick={this.props.onForceReconnect}>
          Try Now
        </button>
      </div>
    );
  }
}
