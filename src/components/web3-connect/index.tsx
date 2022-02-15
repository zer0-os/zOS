import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { providers } from 'ethers';

import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { ConnectionStatus, Connectors } from '../../lib/web3';
import { setAddress, setConnectionStatus, updateConnector } from '../../store/web3';

export interface Properties {
  connectionStatus: ConnectionStatus,
  setConnectionStatus: (status: ConnectionStatus) => void,
  setAddress: (address: string) => void,
  updateConnector: (connector: Connectors) => void,
  providerService: { register: (provider: any) => void },
  connectors: { get: (connector: Connectors) => any },
  currentConnector: Connectors,
  web3: {
    activate: (connector: any) => void,
    active: boolean,
    account: string,
    library: providers.Web3Provider,
    connector: any,
  },
}

interface State {
  hasConnected: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const { web3: { status, value: { connector } } } = state;

    return {
      connectionStatus: status,
      currentConnector: connector,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      setAddress,
      setConnectionStatus,
      updateConnector,
    };
  }

  state = { hasConnected: false };

  componentDidMount() {
    this.setReadOnlyConnector();
  }

  setReadOnlyConnector() {
    this.props.updateConnector(Connectors.Infura);
  }

  async activateCurrentConnector() {
    const { web3, connectors, currentConnector } = this.props;

    if (web3.connector) {
      // it is unclear whether this needs to happen before
      // or after the new connector is activated. this is simplest,
      // but if the gap between connector availabiliity causes issues
      // we can just save the old connector here and deactivate once
      // the new one is connected.
      web3.connector.deactivate();
    }

    web3.activate(connectors.get(currentConnector));
  }

  syncGlobalsForConnectedStatus() {
    const { web3 } = this.props;

    this.props.providerService.register(web3.library);
    this.props.setConnectionStatus(ConnectionStatus.Connected);

    if (web3.account) {
      this.props.setAddress(web3.account);
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const {
      connectionStatus: previousConnectionStatus,
      web3: {
        active: previouslyActive,
        library: previousLibrary,
      },
    } = prevProps;
    const { web3, connectionStatus } = this.props;

    if (this.props.currentConnector !== prevProps.currentConnector) {
      this.activateCurrentConnector();
    }

    if (web3.active && ( !previouslyActive || ( web3.library !== previousLibrary ))) {
      this.syncGlobalsForConnectedStatus();
    }

    if (previousConnectionStatus !== ConnectionStatus.Connected && connectionStatus === ConnectionStatus.Connected) {
      this.setState({ hasConnected: true });
    }
  }

  get shouldRender() {
    return ( this.props.connectionStatus === ConnectionStatus.Connected ) || this.state.hasConnected;
  }

  render() {
    if (!this.shouldRender) return null;

    return this.props.children;
  }
}

export const Web3Connect = injectProviderService(injectWeb3(connectContainer<{}>(Container)));
