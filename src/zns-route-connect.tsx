import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { History } from 'history';

import { setRoute } from './store/zns';
import { setSelectedApp } from './store/apps';
import { Main } from './Main';
import { Apps } from './lib/apps';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';
import { Create as CreateAccount } from './components/account/create';
import { Provider as AuthenticationContextProvider } from './components/authentication/context';

export interface Properties {
  setRoute: (routeApp: { route: string; hasAppChanged: boolean }) => void;
  setSelectedApp: (selectedApp: Apps) => void;

  match: { params: { znsRoute: string; app: string } };
  history: History;
  location: { pathname: string; search: string };
  isAuthenticated: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      isAuthenticated: !!state.authentication.user?.data,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setRoute, setSelectedApp };
  }

  componentDidMount() {
    this.props.setRoute({ route: this.extractRouteFromProps(), hasAppChanged: false });
    this.props.setSelectedApp(this.extractAppFromProps());

    this.redirectOnInvalidRoute();
  }

  componentDidUpdate(prevProps: Properties) {
    const selectedApp = this.extractAppFromProps();
    const hasAppChanged = selectedApp !== this.extractAppFromProps(prevProps);
    const route = this.extractRouteFromProps();

    if (route !== this.extractRouteFromProps(prevProps)) {
      this.props.setRoute({
        route,
        hasAppChanged,
      });
    }

    if (hasAppChanged) {
      this.props.setSelectedApp(selectedApp);
    }

    // leave redirect for last. at this point we have
    // updated state to reflect the current url. the redirect only
    // adds the leading zero, which should not trigger a state
    // change, since state already matches the resulting zna.
    this.redirectOnInvalidRoute();
  }

  redirectOnInvalidRoute() {
    const {
      location: { pathname, search },
    } = this.props;

    if (/^\/$/.test(pathname)) return false;

    this.props.history.replace({
      pathname: '/',
      search: search || '',
    });

    return true;
  }

  extractRouteFromProps(_props: Properties = this.props) {
    return '/';
  }

  extractAppFromProps(props: Properties = this.props) {
    return props.match.params.app as Apps;
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

export const ZnsRouteConnect = connectContainer<{}>(Container);
