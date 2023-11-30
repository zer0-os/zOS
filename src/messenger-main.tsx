import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';

import { Main } from './Main';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';
import { Create as CreateAccount } from './components/account/create';
import { Provider as AuthenticationContextProvider } from './components/authentication/context';

export interface Properties {
  isAuthenticated: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      isAuthenticated: !!state.authentication.user?.data,
    };
  }

  static mapActions() {
    return {};
  }

  get authenticationContext() {
    const { isAuthenticated } = this.props;
    return {
      isAuthenticated,
    };
  }

  render() {
    return (
      <>
        <CreateAccount />
        <AuthenticationContextProvider value={this.authenticationContext}>
          <ZUIProvider>
            <Main />
          </ZUIProvider>
        </AuthenticationContextProvider>
      </>
    );
  }
}

export const MessengerMain = connectContainer<{}>(Container);
