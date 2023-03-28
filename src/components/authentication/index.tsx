import React from 'react';

import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { ConnectionStatus, Connectors, personalSignToken } from '../../lib/web3';
import { nonceOrAuthorize, clearSession, fetchCurrentUserWithChatAccessToken } from '../../store/authentication';
import { AuthenticationState } from '../../store/authentication/types';
import { updateConnector } from '../../store/web3';

export interface Properties {
  connectionStatus: ConnectionStatus;
  providerService: { get: () => any };
  currentAddress: string;
  updateConnector: (Connectors) => void;
  nonceOrAuthorize: (payload: { signedWeb3Token: string }) => void;
  clearSession: () => void;
  fetchCurrentUserWithChatAccessToken: () => void;
  user: AuthenticationState['user'];
  personalSignToken: any;
}

interface State {
  hasConnected: boolean;
}

export class Container extends React.Component<Properties, State> {
  static defaultProps = {
    personalSignToken,
  };

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
      nonceOrAuthorize,
      fetchCurrentUserWithChatAccessToken,
      clearSession,
      updateConnector,
    };
  }

  async componentDidMount() {
    await this.props.fetchCurrentUserWithChatAccessToken();
  }

  componentDidUpdate(prevProps: Properties) {
    if (
      this.props.connectionStatus === ConnectionStatus.Connected &&
      this.props.currentAddress &&
      this.props.currentAddress !== prevProps.currentAddress &&
      this.props.user.isLoading === false
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
      this.props.clearSession();
    }
  }

  async authorize() {
    const { personalSignToken, currentAddress, nonceOrAuthorize, updateConnector, clearSession, providerService } =
      this.props;

    await personalSignToken(providerService.get(), currentAddress)
      .then((signedWeb3Token) => {
        clearSession();
        nonceOrAuthorize({ signedWeb3Token });
      })
      .catch((_error) => {
        updateConnector(Connectors.None);
      });
  }

  render() {
    return null;
  }
}

export const Authentication = injectProviderService(injectWeb3(connectContainer<{}>(Container)));
