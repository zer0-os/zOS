import classNames from 'classnames';
import React from 'react';
import { config } from '../../config';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { getChainNameFromId } from '../../lib/web3/chains';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { Web3State, setWalletModalOpen, updateConnector } from '../../store/web3';
import { isElectron } from '../../utils';
import { Button as ConnectButton } from '../../components/authentication/button';
import './styles.scss';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { updateSidekick } from '../../store/layout';
import { UserActionsContainer } from '../user-actions/container';

import { WalletSelectModal } from '../wallet-select/modal';
import { WalletType } from '../wallet-select/wallets';
import { loginByWeb3 } from '../../store/login';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  currentAddress: string;
  connectionStatus: ConnectionStatus;
  updateConnector: (connector: WalletType | Connectors.None) => void;
  loginByWeb3: (connector: Connectors) => void;
  setWalletModalOpen: (isWalletModalOpen: boolean) => void;
  isWalletModalOpen: Web3State['isWalletModalOpen'];
  userImageUrl: string;
  userIsOnline: boolean;
  updateConversationState: (isOpen: boolean) => void;
  isConversationListOpen: boolean;
  isConnecting: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      web3: { status, value, isWalletModalOpen },
      authentication: { user },
      login,
      layout,
    } = state;

    const userData = user?.data;

    return {
      currentAddress: value.address,
      connectionStatus: status,
      isWalletModalOpen,
      userImageUrl: userData?.profileSummary?.profileImage || '',
      userIsOnline: !!userData?.isOnline,
      isConversationListOpen: !!layout?.value?.isSidekickOpen,
      isConnecting: login.loading,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      updateConnector,
      loginByWeb3,
      setWalletModalOpen,
      updateConversationState: (isOpen: boolean) => updateSidekick({ isOpen }),
    };
  }

  handleDisconnect = () => {
    this.props.updateConnector(Connectors.None);
  };

  get showModal(): boolean {
    return this.props.isWalletModalOpen;
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

  closeModal = () => this.props.setWalletModalOpen(false);

  handleWalletSelected = (connector) => {
    this.props.loginByWeb3(connector);
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
            isConnecting={this.props.isConnecting}
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
