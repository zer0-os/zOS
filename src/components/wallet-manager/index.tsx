import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { EthAddress, Button, WalletSelectModal, WalletType } from '@zer0-os/zos-component-library';
import { updateConnector } from '../../store/web3';
import  { ConnectionStatus, Connectors } from '../../lib/web3';
import { isElectron } from '../../utils';

import './styles.scss';

export interface Properties {
  currentAddress: string;
  currentConnector: Connectors;
  connectionStatus: ConnectionStatus;
  updateConnector: (connector: WalletType) => void;
}

export interface State {
  showModal: boolean;
  walletSelected: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const { web3: { status, value } } = state;

    return {
      currentConnector: value.connector,
      currentAddress: value.address,
      connectionStatus: status,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      updateConnector,
    };
  }

  state = { showModal: false, walletSelected: false };

  componentDidUpdate(prevProps: Properties) {
    if (
      ( this.props.connectionStatus === ConnectionStatus.Connected ) &&
      ( prevProps.connectionStatus !== ConnectionStatus.Connected )
    ) {
      this.closeModal();
      this.setState({ walletSelected: false });
    }

    if (
      ( this.props.connectionStatus === ConnectionStatus.Disconnected ) &&
      ( prevProps.connectionStatus !== this.props.connectionStatus )
    ) {
      this.setState({ walletSelected: false });
    }
  }

  get showButton(): boolean {
    return !(
      ( this.props.connectionStatus === ConnectionStatus.Connected ) &&
      ( this.props.currentConnector === Connectors.Metamask )
    );
  }

  get showModal(): boolean {
    return this.state.showModal;
  }

  get isConnecting(): boolean {
    return this.state.walletSelected || ( this.props.connectionStatus === ConnectionStatus.Connecting );
  }

  get availableWallets(): WalletType[] {
    if (isElectron()) {
      return [
        WalletType.WalletConnect,
        WalletType.Coinbase,
        WalletType.Fortmatic,
        WalletType.Portis,
      ];  
    }

    return [
      WalletType.Metamask,
      WalletType.WalletConnect,
      WalletType.Coinbase,
      WalletType.Fortmatic,
      WalletType.Portis,
    ];
  }

  openModal = () => this.setState({ showModal: true });
  closeModal = () => this.setState({ showModal: false });

  handleWalletSelected = (connector: WalletType) => {
    this.setState({ walletSelected: true });
    this.props.updateConnector(connector);
  }

  render() {
    return (
      <div className="wallet-manager">
        {this.props.currentAddress && <EthAddress address={this.props.currentAddress} />}
        {this.showButton && (
          <Button
            className='wallet-manager__connect-button'
            label='Connect'
            onClick={this.openModal}
          />
        )}
        {this.showModal && (
          <WalletSelectModal
            wallets={this.availableWallets}
            isConnecting={this.isConnecting}
            onClose={this.closeModal}
            onSelect={this.handleWalletSelected}
          />
        )}
      </div>
    );
  }
}

export const WalletManager = connectContainer<{}>(Container);
