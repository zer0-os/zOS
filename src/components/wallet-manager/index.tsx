import { WalletSelectModal, WalletType } from '@zer0-os/zos-component-library';
import classNames from 'classnames';
import React from 'react';
import { config } from '../../config';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { getChainNameFromId } from '../../lib/web3/chains';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { updateConnector, Web3State, setWalletModalOpen } from '../../store/web3';
import { isElectron } from '../../utils';
import { Button as ConnectButton } from '../../components/authentication/button';
import './styles.scss';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { updateSidekick } from '../../store/layout';
import { UserActionsContainer } from '../user-actions/container';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  currentAddress: string;
  currentConnector: Connectors;
  connectionStatus: ConnectionStatus;
  updateConnector: (connector: WalletType | Connectors.None) => void;
  setWalletModalOpen: (isWalletModalOpen: boolean) => void;
  isWalletModalOpen: Web3State['isWalletModalOpen'];
  userImageUrl: string;
  userIsOnline: boolean;
  updateConversationState: (isOpen: boolean) => void;
  isConversationListOpen: boolean;
}

export interface State {
  walletSelected: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      web3: { status, value, isWalletModalOpen },
      authentication: {
        user: { data: userData },
      },
      layout,
    } = state;

    return {
      currentConnector: value.connector,
      currentAddress: value.address,
      connectionStatus: status,
      isWalletModalOpen,
      userImageUrl: userData?.profileSummary?.profileImage || '',
      userIsOnline: !!userData?.isOnline,
      isConversationListOpen: !!layout?.value?.isSidekickOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      updateConnector,
      setWalletModalOpen,
      updateConversationState: (isOpen: boolean) => updateSidekick({ isOpen }),
    };
  }

  state = { walletSelected: false };

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

  handleDisconnect = () => {
    this.props.updateConnector(Connectors.None);
  };

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

  openModal = () => this.props.setWalletModalOpen(true);
  closeModal = () => this.props.setWalletModalOpen(false);

  handleWalletSelected = (connector: WalletType) => {
    this.setState({ walletSelected: true });
    this.props.updateConnector(connector);
  };

  render() {
    return (
      <div className={classNames('wallet-manager', this.props.className)}>
        <IfAuthenticated showChildren>
          <UserActionsContainer
            userAddress={this.props.currentAddress}
            userImageUrl={this.props.userImageUrl}
            userIsOnline={this.props.userIsOnline}
            updateConversationState={this.props.updateConversationState}
            isConversationListOpen={this.props.isConversationListOpen}
            onDisconnect={this.handleDisconnect}
          />
        </IfAuthenticated>
        <IfAuthenticated hideChildren>
          <ConnectButton />
        </IfAuthenticated>
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

export const WalletManager = connectContainer<PublicProperties>(Container);
