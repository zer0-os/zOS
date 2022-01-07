import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { Button } from '../../shared-components/button';
import { WalletSelectModal } from '../../shared-components/wallet-select/modal';
import { updateConnector } from '../../store/web3';
import { WalletType } from '../../shared-components/wallet-select/wallets';
import  {ConnectionStatus } from '../../lib/web3';

import './styles.css';

export interface Properties {
  connectionStatus: ConnectionStatus;
  updateConnector: (connector: WalletType) => void;
}

export interface State {
  showModal: boolean;
  walletSelected: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const { web3: { status } } = state;

    return {
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
    }
  }

  get showModal() {
    return this.state.showModal;
  }

  get isConnecting() {
    return this.state.walletSelected || ( this.props.connectionStatus === ConnectionStatus.Connecting );
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
        <Button className='wallet-manager__connect-button' label='Connect Wallet' onClick={this.openModal} />
        {this.showModal && (
          <WalletSelectModal
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
