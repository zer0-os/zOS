import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { withWeb3 } from 'web3-react';

export enum Connectors {
  Infura = 'infura',
}

export interface Properties {
  web3: any;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
    };
  }

  componentDidMount() {
    this.props.web3.setConnector(Connectors.Infura);
  }

  get isActive() {
    return this.props.web3.active;
  }

  render() {
    if (!this.isActive) return null;

    return this.props.children;
  }
}

export const Web3Connect = withWeb3(
  connectContainer<{}>(Container),
  {
    recreateOnNetworkChange: false,
    recreateOnAccountChange: false,
  },
);
