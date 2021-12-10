import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { providers } from 'ethers';

import { inject as injectWeb3 } from '../../lib/web3/web3-react';

export enum Connectors {
  Infura = 'infura',
}

export interface Properties {
  providerService: { register: (provider: any) => void },
  connectors: { get: (connector: Connectors) => any },
  web3: {
    activate: (connector: any) => void,
    active: boolean,
    library: providers.Web3Provider,
  },
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
    this.activateInfuraConnector();
  }

  async activateInfuraConnector() {
    const connector = this.props.connectors.get(Connectors.Infura);

    this.props.web3.activate(connector);
  }

  componentDidUpdate({ web3: { active: previouslyActive } }) {
    const { web3 } = this.props;

    if (!previouslyActive && web3.active) {
      this.props.providerService.register(web3.library);
    }
  }

  get isActive() {
    return this.props.web3.active;
  }

  render() {
    if (!this.isActive) return null;

    return this.props.children;
  }
}

export const Web3Connect = injectWeb3(connectContainer<{}>(Container));
