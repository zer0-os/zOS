/**
 * NOTE: this module provides some isolation around web3-react while
 * allowing us to take advantage of the functionality in the
 * short-term. the project itself is a mess, and totally untested
 * but i *think* it should be safe enough to use short-term, as
 * some other popular-ish projects are using it. all we need from it is
 * the basic state management, so we should be able to keep it isolated
 * here until we have the time to replace it.
 **/

import React from 'react';

import { Web3ReactProvider, getWeb3ReactContext } from '@web3-react/core';
import { providers } from 'ethers';

import { Connectors } from '../../lib/web3';
import * as walletConnectors from './connectors';

export class ContextProvider extends React.Component {
  getLibrary = (provider) => new providers.Web3Provider(provider);

  render() {
    return (
      <Web3ReactProvider getLibrary={this.getLibrary}>
        {this.props.children}
      </Web3ReactProvider>
    );
  }
}

export class ConnectorProvider extends React.Component {
  get(_connectorType: Connectors) {
    return walletConnectors.network;
  }
}

export function inject<T>(ChildComponent: any) {
  const getConnector = (connectorType: Connectors) => {
    switch (connectorType) {
      case Connectors.Metamask:
        return walletConnectors.injected;
      case Connectors.WalletConnect:
        return walletConnectors.walletConnect;
      case Connectors.Coinbase:
        return walletConnectors.walletLink;
      case Connectors.Fortmatic:
        return walletConnectors.fortmatic;
      case Connectors.Portis:
        return walletConnectors.portis;
      default:
        return walletConnectors.network;
    }
  }

  return class ReactWeb3Injector extends React.Component<T> {
    static contextType = getWeb3ReactContext();

    render() {
      return <ChildComponent {...this.props} connectors={{ get: getConnector }} web3={this.context} />;
    }
  };
}
