import React from 'react';

import { AuthenticationContext } from './authentication';
import { connectContainer } from '../store/redux-container';

export interface PublicProperties {}

export interface Properties {
  isAuthenticated: boolean;
}

class Container extends React.Component<Properties> {
  static contextType = AuthenticationContext;

  static mapState(state) {
    return {
      isAuthenticated: !!state.authentication.user.data,
    };
  }

  static mapActions(_props) {
    return {};
  }

  render() {
    const { isAuthenticated } = this.props;

    return (
      <AuthenticationContext.Provider value={{ isAuthenticated }}>{this.props.children}</AuthenticationContext.Provider>
    );
  }
}

export const AuthenticationContextProvider = connectContainer<PublicProperties>(Container);
