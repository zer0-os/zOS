import React from 'react';

import './styles.scss';

export interface Properties {
  supportedNetwork: string;
}

export class ErrorNetwork extends React.Component<Properties> {
  render() {
    const supportedNetwork = this.props.supportedNetwork;

    return (
      <div className='error-network'>
        <span title={supportedNetwork} className='error-network__chainId'>
          Please switch to supported Network {supportedNetwork} in your wallet before connecting
        </span>
      </div>
    );
  }
}
