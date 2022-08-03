import React from 'react';
import { RootState } from './store';
import { connectContainer } from './store/redux-container';
import { History } from 'history';

import { setRoute } from './store/zns';
import { setSelectedApp } from './store/apps';
import { Web3Connect } from './components/web3-connect';
import { Main } from './Main';
import { Apps } from './lib/apps';

export interface Properties {
  setRoute: (routeApp: { route: string; hasAppChanged: boolean }) => void;
  setSelectedApp: (selectedApp: Apps) => void;

  match: { params: { znsRoute: string; app: string } };
  history: History;
  location: { pathname: string; search: string };
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setRoute, setSelectedApp };
  }

  componentDidMount() {
    if (this.redirectOnInvalidRoute()) return;

    this.props.setRoute({ route: this.extractRouteFromProps(), hasAppChanged: false });
    this.props.setSelectedApp(this.extractAppFromProps());
  }

  componentDidUpdate(prevProps: Properties) {
    if (this.redirectOnInvalidRoute()) return;

    const selectedApp = this.extractAppFromProps();
    const hasAppChanged = selectedApp !== this.extractAppFromProps(prevProps);

    if (this.hasRouteChanged(prevProps)) {
      this.props.setRoute({
        route: this.extractRouteFromProps(),
        hasAppChanged,
      });
    }

    if (hasAppChanged) {
      this.props.setSelectedApp(selectedApp);
    }
  }

  hasRouteChanged(prevProps: Properties) {
    return this.props.match.params.znsRoute !== prevProps.match.params.znsRoute;
  }

  redirectOnInvalidRoute() {
    const {
      location: { pathname, search },
    } = this.props;

    if (/^\/0\./.test(pathname)) return false;

    this.props.history.replace({
      pathname: pathname.replace(/^\//, '/0.'),
      search: search || '',
    });

    return true;
  }

  extractRouteFromProps(props: Properties = this.props) {
    return props.match.params.znsRoute.replace(/^0\./, '');
  }

  extractAppFromProps(props: Properties = this.props) {
    return props.match.params.app as Apps;
  }

  render() {
    return (
      <Web3Connect>
        <Main />
      </Web3Connect>
    );
  }
}

export const ZnsRouteConnect = connectContainer<{}>(Container);
