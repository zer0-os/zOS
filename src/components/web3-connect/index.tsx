import React, { ReactNode } from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { providers } from 'ethers';

import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { Chains, ConnectionStatus, Connectors } from '../../lib/web3';
import { setChain, setAddress, setConnectionStatus, updateConnector, setConnectionError } from '../../store/web3';

export interface Properties {
  children?: ReactNode;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setAddress: (address: string) => void;
  setChain: (chain: Chains) => void;
  setConnectionError: (message: string) => void;
  updateConnector: (connector: Connectors) => void;
  providerService: { register: (provider: any) => void };
  connectors: { get: (connector: Connectors) => any };
  currentConnector: Connectors;
  web3: {
    activate: (connector: any, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<any>;
    active: boolean;
    account: string;
    chainId: Chains;
    library: providers.Web3Provider;
    connector: any;
  };
}

interface State {
  hasConnected: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      web3: {
        status,
        value: { connector },
      },
    } = state;

    return {
      connectionStatus: status,
      currentConnector: connector,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      setChain,
      setAddress,
      setConnectionStatus,
      setConnectionError,
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

  onActivateError(message: string): void {
    this.props.setConnectionError(message);
    this.props.updateConnector(Connectors.None);
    this.props.setConnectionStatus(ConnectionStatus.Disconnected);
  }

  deactivateConnector() {
    if (localStorage) {
      localStorage.removeItem('previousConnector');
    }
    this.props.updateConnector(Connectors.Infura);
  }

  reconnectPreviousConnector() {
    const { currentConnector } = this.props;

    if (
      currentConnector &&
      currentConnector !== Connectors.Infura &&
      localStorage &&
      !localStorage.getItem('previousConnector')
    ) {
      localStorage.setItem('previousConnector', currentConnector);
    }

    if (localStorage.getItem('previousConnector') && currentConnector === Connectors.Infura) {
      const previousConnector = localStorage.getItem('previousConnector');
      this.props.updateConnector(Connectors[previousConnector.charAt(0).toUpperCase() + previousConnector.slice(1)]);
    }
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
    const connector = connectors.get(currentConnector);

    try {
      await web3.activate(connector, null, true);
    } catch (error) {
      this.onActivateError(this.translateError(error));
    }
  }

  translateError(error: any) {
    if (error.code && error.code === -32002) {
      return 'Wallet request already pending. You may have another window already open.';
    }

    return 'Wallet connection failed. Please try again.';
  }

  syncGlobalsForConnectedStatus() {
    const { web3 } = this.props;

    this.props.providerService.register(web3.library);
    this.props.setConnectionStatus(ConnectionStatus.Connected);
  }

  componentDidUpdate(prevProps: Properties) {
    const {
      connectionStatus: previousConnectionStatus,
      web3: { chainId: prevChainId, active: previouslyActive, library: previousLibrary, account: previouslyAccount },
    } = prevProps;
    const { web3, connectionStatus } = this.props;

    if (web3.chainId !== prevChainId) {
      this.props.setChain(web3.chainId);
    }

    if (this.props.currentConnector !== prevProps.currentConnector) {
      this.activateCurrentConnector();
    }

    if (
      (web3.active && (!previouslyActive || web3.library !== previousLibrary)) ||
      web3.account !== previouslyAccount
    ) {
      this.syncGlobalsForConnectedStatus();
    }

    if (previousConnectionStatus !== ConnectionStatus.Connected && connectionStatus === ConnectionStatus.Connected) {
      this.setState({ hasConnected: true });
      this.reconnectPreviousConnector();
    }

    if (prevProps.currentConnector !== Connectors.Infura && !web3.account && web3.account !== previouslyAccount) {
      this.deactivateConnector();
    }

    if (web3.account !== previouslyAccount) {
      this.props.setAddress(web3.account);
    }
  }

  get shouldRender() {
    return this.props.connectionStatus === ConnectionStatus.Connected || this.state.hasConnected;
  }

  render() {
    if (!this.shouldRender) return null;

    return this.props.children;
  }
}

export const Web3Connect = injectProviderService(injectWeb3(connectContainer<{}>(Container)));
