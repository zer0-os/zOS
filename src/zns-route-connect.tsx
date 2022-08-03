import React from 'react';
import { RootState } from './store';
import { connectContainer } from './store/redux-container';

import { setRoute } from './store/zns';
import { setSelectedApp } from './store/apps';
import { Web3Connect } from './components/web3-connect';
import { Main } from './Main';
import { Apps } from './lib/apps';

export interface Properties {
  setRoute: (routeApp: { route: string; hasAppChanged: boolean }) => void;
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
    this.props.setRoute({ route: this.extractRouteFromProps(), hasAppChanged: false });
    this.props.setSelectedApp(this.extractAppFromProps());
  }

  componentDidUpdate(prevProps: Properties) {
    const route = this.extractRouteFromProps();
    const selectedApp = this.extractAppFromProps();
    const hasAppChanged = selectedApp !== this.extractAppFromProps(prevProps);

    if (route !== this.extractRouteFromProps(prevProps)) {
      this.props.setRoute({ route, hasAppChanged });
    }

    if (hasAppChanged) {
      this.props.setSelectedApp(selectedApp);
    }
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
