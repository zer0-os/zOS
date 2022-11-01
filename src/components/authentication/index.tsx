import React from 'react';
import Web3Utils from 'web3-utils';

import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { config } from '../../config';
import { authorize, fetchCurrentUser, clearSession } from '../../store/authentication';
import { AuthenticationState } from '../../store/authentication/types';
import { updateConnector } from '../../store/web3';

export interface Properties {
  connectionStatus: ConnectionStatus;
  providerService: { get: () => any };
  currentAddress: string;
  updateConnector: (Connectors) => void;
  authorizeUser: (payload: { signedWeb3Token: string }) => void;
  clearSession: () => void;
  fetchCurrentUser: () => void;
  user: AuthenticationState['user'];
}

interface State {
  hasConnected: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      authentication: { user },
      web3: { status, value },
    } = state;

    return {
      currentAddress: value.address,
      connectionStatus: status,
      user,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      authorizeUser: authorize,
      fetchCurrentUser,
      clearSession,
      updateConnector,
    };
  }

  componentDidMount() {
    this.props.fetchCurrentUser();
  }

  componentDidUpdate(prevProps: Properties) {
    if (
      prevProps.connectionStatus !== ConnectionStatus.Connected &&
      this.props.connectionStatus === ConnectionStatus.Connected &&
      this.props.currentAddress &&
      this.props.user.isLoading === false &&
      this.props.user.data === null
    ) {
      this.authorize();
    }

    if (
      prevProps.connectionStatus !== ConnectionStatus.Connected &&
      this.props.connectionStatus === ConnectionStatus.Connected &&
      this.props.user.isLoading === false &&
      !this.props.currentAddress &&
      this.props.user.data !== null
    ) {
      this.logout();
    }
  }

  logout(): void {
    this.props.clearSession();
  }

  authorize(): void {
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
          if (err) {
            this.props.updateConnector(Connectors.None);
            console.log(err);
          }

          this.props.authorizeUser({ signedWeb3Token: res.result });
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return null;
  }
}

export const Authentication = injectProviderService(injectWeb3(connectContainer<{}>(Container)));
