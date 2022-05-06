import React from 'react';

export interface Properties {
  account?: string;
}

export class Connect extends React.Component<Properties> {
  get message() {
    if (this.props.account) {
      return `Connecting with account [${this.props.account}].`;
    }

    return 'Please connect a wallet to continue.';
  }

  render() {
    return (
      <div className='connect'>
        <div className='connect__message'>{this.message}</div>
      </div>
    );
  }
}
