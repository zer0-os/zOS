import { Button, EthAddress, WalletSelectModal, WalletType } from '@zer0-os/zos-component-library';
import classNames from 'classnames';
import React from 'react';
import { config } from '../../config';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { getChainNameFromId } from '../../lib/web3/chains';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { updateConnector, Web3State, setWalletModalOpen } from '../../store/web3';
import { authorize } from '../../store/authentication';
import { isElectron } from '../../utils';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import Web3Utils from 'web3-utils';

import './styles.scss';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  currentAddress: string;
  currentConnector: Connectors;
  connectionStatus: ConnectionStatus;
  updateConnector: (connector: WalletType) => void;
  setWalletModalOpen: (isWalletModalOpen: boolean) => void;
  isWalletModalOpen: Web3State['isWalletModalOpen'];
  authorize: (payload: { signedWeb3Token: string }) => void;
  providerService: { get: () => any };
}

export interface State {
  walletSelected: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      web3: { status, value, isWalletModalOpen },
    } = state;

    return {
      currentConnector: value.connector,
      currentAddress: value.address,
      connectionStatus: status,
      isWalletModalOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      updateConnector,
      setWalletModalOpen,
      authorize,
    };
  }

  state = { walletSelected: false };

  componentDidUpdate(prevProps: Properties) {
    if (
      this.props.connectionStatus === ConnectionStatus.Connected &&
      prevProps.connectionStatus !== ConnectionStatus.Connected
    ) {
      this.onConnect();
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
    return this.props.isWalletModalOpen;
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

  onConnect(): void {
    this.closeModal();
    this.setState({ walletSelected: false });

    this.login();
  }

  login(): void {
    const web3Provider = this.props.providerService.get();

    const method = 'personal_sign';
    const from = Web3Utils.toHex(this.props.currentAddress.toLowerCase());
    const params = [
      config.web3AuthenticationMessage,
      from,
    ];

    try {
      web3Provider.provider.sendAsync(
        {
          method,
          params,
          from,
        },
        (err, res) => {
          if (err) console.log(err);

          this.props.authorize({ signedWeb3Token: res.result });
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  openModal = () => this.props.setWalletModalOpen(true);
  closeModal = () => this.props.setWalletModalOpen(false);

  handleWalletSelected = (connector: WalletType) => {
    this.setState({ walletSelected: true });
    this.props.updateConnector(connector);
  };

  render() {
    return (
      <div className={classNames('wallet-manager', this.props.className)}>
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

export const WalletManager = injectProviderService<PublicProperties>(connectContainer<PublicProperties>(Container));
