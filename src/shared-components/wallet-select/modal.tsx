import React from 'react';
import classNames from 'classnames';

import './styles.css';
import { WalletSelect } from '.';

export interface Properties {
  className?: string;
}

export class WalletSelectModal extends React.Component<Properties> {
  render() {
    return (
      <div className={classNames('wallet-select-modal', this.props.className)}>
        <WalletSelect />
      </div>
    );
  }
}
