import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { Button } from '../../shared-components/button';
import { WalletSelectModal } from '../../shared-components/wallet-select/modal';
import { updateConnector } from '../../store/web3';
import { WalletType } from '../../shared-components/wallet-select/wallets';

import './styles.css';

export interface Properties {
  updateConnector: (connector: WalletType) => void;
}

export interface State {
  showModal: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(_state: RootState): Partial<Properties> {
    return {
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      updateConnector: (connector: WalletType) => updateConnector,
    };
  }

  state = { showModal: false };

  get showModal() {
    return this.state.showModal;
  }

  openModal = () => this.setState({ showModal: true });
  closeModal = () => this.setState({ showModal: false });

  handleWalletSelected = (connector: WalletType) => {
    this.props.updateConnector(connector);
  }

  render() {
    return (
      <div className="wallet-manager">
        <Button className='wallet-manager__connect-button' label='Connect Wallet' onClick={this.openModal} />
        {this.showModal && (
          <WalletSelectModal
            onClose={this.closeModal}
            onSelect={this.handleWalletSelected}
          />
        )}
      </div>
    );
  }
}

export const WalletManager = connectContainer<{}>(Container);
