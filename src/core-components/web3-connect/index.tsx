import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { providers } from 'ethers';

import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { setConnectionStatus, updateConnector } from '../../store/web3';

export interface Properties {
  connectionStatus: ConnectionStatus,
  setConnectionStatus: (status: ConnectionStatus) => void,
  updateConnector: (connector: Connectors) => void,
  providerService: { register: (provider: any) => void },
  connectors: { get: (connector: Connectors) => any },
  currentConnector: Connectors,
  web3: {
    activate: (connector: any) => void,
    active: boolean,
    library: providers.Web3Provider,
  },
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { web3: { status, value: { connector } } } = state;

    return {
      connectionStatus: status,
      currentConnector: connector,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      setConnectionStatus,
      updateConnector,
    };
  }

  componentDidMount() {
    this.setReadOnlyConnector();
  }

  setReadOnlyConnector() {
    this.props.updateConnector(Connectors.Infura);
  }

  async activateCurrentConnector() {
    const connector = this.props.connectors.get(this.props.currentConnector);

    this.props.web3.activate(connector);
  }

  componentDidUpdate(prevProps: Properties) {
    const { web3: { active: previouslyActive, library: previousLibrary } } = prevProps;
    const { web3, connectionStatus } = this.props;

    if (this.props.currentConnector !== prevProps.currentConnector) {
      this.activateCurrentConnector();
    }

    if (web3.active && (!previouslyActive || ( web3.library !== previousLibrary ))) {
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
