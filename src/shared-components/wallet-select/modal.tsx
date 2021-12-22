import React from 'react';
import classNames from 'classnames';

import './styles.css';
import { Dialog } from '../dialog';
import { WalletSelect, Properties as WalletSelectProperties } from '.';

export interface Properties extends WalletSelectProperties {
  className?: string;
  onClose?: () => void;
}

export class WalletSelectModal extends React.Component<Properties> {
  handleClose = () => this.props.onClose && this.props.onClose();

  render() {
    return (
      <Dialog className={classNames('wallet-select-modal', this.props.className)} onClose={this.handleClose}>
        <WalletSelect onSelect={this.props.onSelect} />
      </Dialog>
    );
  }
}
