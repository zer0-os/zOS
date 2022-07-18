import { Button, EthAddress, WalletSelectModal, WalletType } from '@zer0-os/zos-component-library';
import React from 'react';
import { config } from '../../config';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { getChainNameFromId } from '../../lib/web3/chains';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { updateConnector, Web3State, setWalletOpen } from '../../store/web3';
import { isElectron } from '../../utils';
import './styles.scss';

export interface Properties {
  currentAddress: string;
  currentConnector: Connectors;
  connectionStatus: ConnectionStatus;
  updateConnector: (connector: WalletType) => void;
  setWalletOpen: (isWalletOpen: boolean) => void;
  isWalletOpen: Web3State['isWalletOpen'];
}

export interface State {
  showModal: boolean;
  walletSelected: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      web3: { status, value, isWalletOpen },
    } = state;

    return {
      currentConnector: value.connector,
      currentAddress: value.address,
      connectionStatus: status,
      isWalletOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      updateConnector,
      setWalletOpen,
    };
  }

  state = { showModal: false, walletSelected: false };

  componentDidUpdate(prevProps: Properties) {
    if (
      this.props.connectionStatus === ConnectionStatus.Connected &&
      prevProps.connectionStatus !== ConnectionStatus.Connected
    ) {
      this.closeModal();
      this.setState({ walletSelected: false });
    }

    if (
      (this.props.connectionStatus === ConnectionStatus.Disconnected ||
        this.props.connectionStatus === ConnectionStatus.NetworkNotSupported) &&
      prevProps.connectionStatus !== this.props.connectionStatus
    ) {
      this.setState({ walletSelected: false });
    }
  }

  get showButton(): boolean {
    return !(
      this.props.connectionStatus === ConnectionStatus.Connected && this.props.currentConnector === Connectors.Metamask
    );
  }

  get showModal(): boolean {
    return this.props.isWalletOpen;
  }

  get isConnecting(): boolean {
    return this.state.walletSelected || this.props.connectionStatus === ConnectionStatus.Connecting;
  }

  get isNetworkNotSupported(): boolean {
    return this.props.connectionStatus === ConnectionStatus.NetworkNotSupported;
  }

  get getNetworkNameById() {
    return getChainNameFromId(config.supportedChainId);
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

  openModal = () => this.props.setWalletOpen(true);
  closeModal = () => this.props.setWalletOpen(false);

  handleWalletSelected = (connector: WalletType) => {
    this.setState({ walletSelected: true });
    this.props.updateConnector(connector);
  };

  render() {
    return (
      <div className='wallet-manager'>
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
            isNotSupportedNetwork={this.isNetworkNotSupported}
            networkName={this.getNetworkNameById}
            onClose={this.closeModal}
            onSelect={this.handleWalletSelected}
          />
        )}
      </div>
    );
  }
}

export const WalletManager = connectContainer<{}>(Container);
