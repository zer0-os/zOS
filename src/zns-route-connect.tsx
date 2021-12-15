import React from 'react';
import { RootState } from './store';
import { connectContainer } from './store/redux-container';

import { setRoute } from './store/zns';
import { Web3Connect } from './core-components/web3-connect';
import { Main } from './Main';

export interface Properties {
  setRoute: (route: string) => void;

  match: { params: { znsRoute: string } };
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setRoute };
  }

  componentDidMount() {
    this.props.setRoute(this.extractRouteFromProps());
  }

  componentDidUpdate(prevProps: Properties) {
    const currentRoute = this.extractRouteFromProps();

    if (currentRoute !== this.extractRouteFromProps(prevProps)) {
      this.props.setRoute(currentRoute);
    }
  }

  extractRouteFromProps(props: Properties = this.props) {
    return props.match.params.znsRoute;
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
