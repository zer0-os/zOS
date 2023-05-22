import React from 'react';
import classNames from 'classnames';

import { WalletSelect, Properties as WalletSelectProperties } from '.';
import { WalletType } from './wallets';
import { ErrorNetwork } from './error-network';
import { Modal } from '@zero-tech/zui/components';

export interface Properties extends WalletSelectProperties {
  isConnecting: boolean;
  isNotSupportedNetwork: boolean;
  wallets: WalletType[];
  className?: string;
  networkName: string;
  onClose?: () => void;
  onSelect?: (connector: WalletType) => void;
}

export class WalletSelectModal extends React.Component<Properties> {
  openChanged = (isOpen: boolean) => {
    if (!isOpen) {
      this.props.onClose && this.props.onClose();
    }
  };

  get supportedNetwork() {
    return this.props.isNotSupportedNetwork;
  }

  render() {
    return (
      <Modal
        open={true}
        className={classNames('zos-wallet-select-modal', this.props.className)}
        onOpenChange={this.openChanged}
      >
        <WalletSelect
          wallets={this.props.wallets}
          isConnecting={this.props.isConnecting}
          onSelect={this.props.onSelect}
        />
        {this.supportedNetwork && <ErrorNetwork supportedNetwork={this.props.networkName} />}
      </Modal>
    );
  }
}
