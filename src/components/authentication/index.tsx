import React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { fetchCurrentUserWithChatAccessToken } from '../../store/authentication';
import { AuthenticationState } from '../../store/authentication/types';
import { Redirect } from 'react-router-dom';
import { featureFlags } from '../../lib/feature-flags';

export interface Properties {
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
    } = state;
    return {
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

export const Authentication = connectContainer<{}>(Container);
