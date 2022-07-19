import React from 'react';
import { RootState } from './store';
import { connectContainer } from './store/redux-container';

import { setRoute, setDeepestVisitedRoute } from './store/zns';
import { setSelectedApp } from './store/apps';
import { Web3Connect } from './components/web3-connect';
import { Main } from './Main';
import { Apps } from './lib/apps';

export interface Properties {
  setRoute: (route: string) => void;
  setSelectedApp: (selectedApp: Apps) => void;
  setDeepestVisitedRoute: (route: string) => void;

  match: { params: { znsRoute: string; app: string } };
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setRoute, setDeepestVisitedRoute, setSelectedApp };
  }

  componentDidMount() {
    this.props.setRoute(this.extractRouteFromProps());
    this.props.setSelectedApp(this.extractAppFromProps());
  }

  componentDidUpdate(prevProps: Properties) {
    const currentRoute = this.extractRouteFromProps();
    const selectedApp = this.extractAppFromProps();

    if (currentRoute !== this.extractRouteFromProps(prevProps)) {
      this.props.setRoute(currentRoute);
    }

    if (selectedApp !== this.extractAppFromProps(prevProps)) {
      this.props.setSelectedApp(selectedApp);
      this.props.setDeepestVisitedRoute(currentRoute);
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
