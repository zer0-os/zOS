import React from 'react';

import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { connectContainer } from '../../store/redux-container';
import { ConnectionStatus, Connectors, personalSignToken } from '../../lib/web3';
import { AccountCreationErrors, createWeb3Account } from '../../store/registration';

import { CreateWalletAccount } from '.';
import { RootState } from '../../store/reducer';
import { WalletType } from '../../components/wallet-select/wallets';
import { updateConnector } from '../../store/web3';
import { Web3Connect } from '../../components/web3-connect';
import { AuthenticationState } from '../../store/authentication/types';

export interface Properties {
  providerService: { get: () => any };
  errors: {
    general: string;
  };
  isConnecting: boolean;

  updateConnector: (connector: WalletType | Connectors.None) => void;
  createWeb3Account: (payload: { token: string }) => void;
  connectionStatus: ConnectionStatus;
  currentAddress: string;
  user: AuthenticationState['user'];
}

interface State {
  isSigning: boolean;
  signingError: string;
}

export class Container extends React.Component<Properties, State> {
  state = { isSigning: false, signingError: '' };

  static mapState(state: RootState): Partial<Properties> {
    const {
      authentication: { user },
      web3: { status, value },
      registration: { errors, loading },
    } = state;

    return {
      currentAddress: value.address,
      errors: { general: value.error || Container.mapErrors(errors || []).general },
      connectionStatus: status,
      user,
      isConnecting: status === ConnectionStatus.Connecting || loading,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { createWeb3Account, updateConnector };
  }

  static mapErrors(errors: string[]) {
    const errorObject = {} as Properties['errors'];

    errors.forEach((error) => {
      switch (error) {
        case AccountCreationErrors.PUBLIC_ADDRESS_ALREADY_EXISTS:
          errorObject.general = 'This address has already been registered';
          break;
        default:
          errorObject.general = 'An error has occurred';
          break;
      }
    });

    return errorObject;
  }

  componentDidUpdate(prevProps: Properties) {
    // Don't really like having to react to property changes but the library we use
    // is a react component that is injecting context so moving this logic to the
    // sagas is difficult.
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
    let token;
    this.setState({ isSigning: true, signingError: '' });
    try {
      token = await personalSignToken(this.props.providerService.get(), this.props.currentAddress);
    } catch (error) {
      this.setState({ signingError: this.translateError(error) });
      this.props.updateConnector(Connectors.None);
      return;
    } finally {
      this.setState({ isSigning: false });
    }

    this.props.createWeb3Account({ token });
  };

  translateError(error: any) {
    if (error.code && error.code === -32603) {
      // Metamask: User rejected the signature request by closing the window or clicking Reject
      return '';
    }

    return 'Error signing token';
  }

  render() {
    return (
      <>
        <Web3Connect>
          <CreateWalletAccount
            onSelect={this.connectorSelected}
            error={this.props.errors.general || this.state.signingError}
            isConnecting={this.props.isConnecting || this.state.isSigning}
          />
        </Web3Connect>
      </>
    );
  }
}

export const CreateWalletAccountContainer = injectProviderService(injectWeb3(connectContainer<{}>(Container)));
