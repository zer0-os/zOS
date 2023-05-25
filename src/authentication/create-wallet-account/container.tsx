import React from 'react';

import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { connectContainer } from '../../store/redux-container';
import { ConnectionStatus, Connectors, personalSignToken } from '../../lib/web3';
import { createWeb3Account } from '../../store/registration';

import { CreateWalletAccount } from '.';
import { RootState } from '../../store/reducer';
import { WalletType } from '../../components/wallet-select/wallets';
import { updateConnector } from '../../store/web3';
import { Web3Connect } from '../../components/web3-connect';
import { AuthenticationState } from '../../store/authentication/types';

export interface Properties {
  providerService: { get: () => any };
  error: string;
  isConnecting: boolean;

  updateConnector: (connector: WalletType | Connectors.None) => void;
  createWeb3Account: (payload: { token: string }) => void;
  connectionStatus: ConnectionStatus;
  currentAddress: string;
  user: AuthenticationState['user'];
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      authentication: { user },
      web3: { status, value },
    } = state;

    return {
      currentAddress: value.address,
      error: value.error,
      connectionStatus: status,
      user,
      isConnecting: status === ConnectionStatus.Connecting,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { createWeb3Account, updateConnector };
  }

  componentDidUpdate(prevProps: Properties) {
    if (
      this.props.connectionStatus === ConnectionStatus.Connected &&
      this.props.currentAddress &&
      this.props.currentAddress !== prevProps.currentAddress
    ) {
      this.authorize();
    }
  }

  connectorSelected = async (connector) => {
    this.props.updateConnector(connector);
  };

  authorize = async () => {
    try {
      const { providerService } = this.props;
      const signedToken = await personalSignToken(providerService.get(), this.props.currentAddress);
      this.props.createWeb3Account({ token: signedToken });
    } catch (error) {
      this.props.updateConnector(Connectors.None);
    }
  };

  render() {
    return (
      <>
        <Web3Connect>
          <CreateWalletAccount
            onSelect={this.connectorSelected}
            error={this.props.error}
            isConnecting={this.props.isConnecting}
          />
        </Web3Connect>
      </>
    );
  }
}

export const CreateWalletAccountContainer = injectProviderService(injectWeb3(connectContainer<{}>(Container)));
