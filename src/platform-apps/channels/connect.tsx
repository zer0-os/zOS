import React from 'react';

export interface Properties {
}

export class Connect extends React.Component<Properties> {
  render() {
    return (
      <div className='connect'>
        <div className='connect__message'>Please connect a wallet to continue.</div>
      </div>
    );
  }
}
