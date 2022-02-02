import React from 'react';
import classNames from 'classnames';

import './styles.scss';

export interface Properties {
  address: string;

  className?: string;
}

export class EthAddress extends React.Component<Properties> {
  render() {
    const { address } = this.props;

    return (
      <div className={classNames('eth-address', this.props.className)}>
        <span title={address} className='eth-address__address'>
          <span>{address.slice(0, 6)}</span>
          <span>...</span>
          <span className='eth-address__address-last-four'>{address.slice(-4)}</span>
        </span>
      </div>
    );
  }
}
