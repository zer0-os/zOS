import React from 'react';
import classNames from 'classnames';

import './styles.css';

export interface Properties {
  className?: string;
}

export class WalletSelect extends React.Component<Properties> {
  render() {
    return (
      <div className={classNames('wallet-select', this.props.className)}>
      </div>
    );
  }
}
