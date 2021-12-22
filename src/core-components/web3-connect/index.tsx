import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { providers } from 'ethers';

import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { setConnectionStatus } from '../../store/web3';

export interface Properties {
  connectionStatus: ConnectionStatus,
  setConnectionStatus: (status: ConnectionStatus) => void,
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
      connectionStatus: state.web3.status,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setConnectionStatus };
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
      this.props.setConnectionStatus(ConnectionStatus.Connected);
    }
  }

  get isConnected() {
    return this.props.connectionStatus === ConnectionStatus.Connected;
  }

  render() {
    if (!this.isConnected) return null;

    return this.props.children;
  }
}

export const Web3Connect = injectProviderService(injectWeb3(connectContainer<{}>(Container)));
