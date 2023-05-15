import React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { ConnectionStatus, Connectors, personalSignToken } from '../../lib/web3';
import { nonceOrAuthorize, terminate, fetchCurrentUserWithChatAccessToken } from '../../store/authentication';
import { AuthenticationState } from '../../store/authentication/types';
import { updateConnector } from '../../store/web3';
import { Redirect } from 'react-router-dom';

export interface Properties {
  connectionStatus: ConnectionStatus;
  providerService: { get: () => any };
  currentAddress: string;
  updateConnector: (Connectors) => void;
  nonceOrAuthorize: (payload: { signedWeb3Token: string }) => void;
  terminateAuthorization: () => void;
  fetchCurrentUserWithChatAccessToken: () => void;
  user: AuthenticationState['user'];
  personalSignToken: any;
}

interface State {
  isLoggedIn: boolean;
}

export class Container extends React.Component<Properties, State> {
  state: State = {
    isLoggedIn: true,
  };

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
      terminateAuthorization: terminate,
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
      this.props.terminateAuthorization();
    }

    // loading is done, but user data is still null (that means fetchCurrentUser saga failed),
    // then "force login"
    if (this.props.user.isLoading === false && this.props.user.data === null) {
      this.setState({ isLoggedIn: false });
    }
  }

  async authorize() {
    const {
      personalSignToken,
      currentAddress,
      nonceOrAuthorize,
      updateConnector,
      terminateAuthorization,
      providerService,
    } = this.props;

    await personalSignToken(providerService.get(), currentAddress)
      .then((signedWeb3Token) => {
        terminateAuthorization();
        nonceOrAuthorize({ signedWeb3Token });
      })
      .catch((_error) => {
        updateConnector(Connectors.None);
      });
  }

  redirectIfNotLoggedIn = () => {
    if (!this.state.isLoggedIn) {
      return <Redirect to='/login' />;
    }
  };

  render() {
    return <>{this.redirectIfNotLoggedIn()}</>;
  }
}

export const Authentication = injectProviderService(injectWeb3(connectContainer<{}>(Container)));
