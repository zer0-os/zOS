import React from 'react';
import { RootState } from './store';
import { connectContainer } from './store/redux-container';

import { setRoute } from './store/zns';
import { setSelectedApp } from './store/apps';
import { Web3Connect } from './components/web3-connect';
import { Main } from './Main';
import { Apps } from './lib/apps';

interface RouteApp {
  route: string;
  hasAppChanged: boolean;
}

export interface Properties {
  setRoute: (routeApp: RouteApp) => void;
  setSelectedApp: (selectedApp: Apps) => void;

  match: { params: { znsRoute: string; app: string } };
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setRoute, setSelectedApp };
  }

  componentDidMount() {
    const routeApp: RouteApp = { route: this.extractRouteFromProps(), hasAppChanged: false };
    this.props.setRoute(routeApp);
    this.props.setSelectedApp(this.extractAppFromProps());
  }

  componentDidUpdate(prevProps: Properties) {
    const currentRoute = this.extractRouteFromProps();
    const selectedApp = this.extractAppFromProps();
    let routeApp: RouteApp = { route: currentRoute, hasAppChanged: false };

    if (currentRoute !== this.extractRouteFromProps(prevProps)) {
      if (selectedApp !== this.extractAppFromProps(prevProps)) {
        routeApp.hasAppChanged = true;
      }
      this.props.setRoute(routeApp);
    }

    if (selectedApp !== this.extractAppFromProps(prevProps)) {
      this.props.setSelectedApp(selectedApp);
    }
  }

  extractRouteFromProps(props: Properties = this.props) {
    return props.match.params.znsRoute;
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
