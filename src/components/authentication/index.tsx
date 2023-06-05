import React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { ConnectionStatus } from '../../lib/web3';
import { fetchCurrentUserWithChatAccessToken } from '../../store/authentication';
import { AuthenticationState } from '../../store/authentication/types';
import { Redirect } from 'react-router-dom';
import { featureFlags } from '../../lib/feature-flags';

export interface Properties {
  connectionStatus: ConnectionStatus;
  providerService: { get: () => any };
  currentAddress: string;
  fetchCurrentUserWithChatAccessToken: () => void;
  user: AuthenticationState['user'];
}

interface State {
  isLoggedIn: boolean;
}

export class Container extends React.Component<Properties, State> {
  state: State = {
    isLoggedIn: true,
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
      fetchCurrentUserWithChatAccessToken,
    };
  }

  async componentDidMount() {
    await this.props.fetchCurrentUserWithChatAccessToken();
  }

  componentDidUpdate(prevProps: Properties) {
    // loading is done, but user data is still null (that means fetchCurrentUser saga failed),
    // then "force login"
    if (prevProps.user.isLoading === true && this.props.user.isLoading === false && this.props.user.data === null) {
      this.setState({ isLoggedIn: false });
    }
  }

  redirectIfNotLoggedIn = () => {
    if (!this.state.isLoggedIn && !featureFlags.allowPublicZOS) {
      return <Redirect to='/login' />;
    }
  };

  render() {
    return <>{this.redirectIfNotLoggedIn()}</>;
  }
}

export const Authentication = injectProviderService(injectWeb3(connectContainer<{}>(Container)));
