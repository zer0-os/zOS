/**
 * The purpose of this component is to listen for changes in the user's account,
 * and update the Redux store accordingly.
 */

import * as React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { watchAccount } from '@wagmi/core';
import { getWagmiConfig } from '../wagmi-config';
import { Chains, ConnectionStatus } from '..';
import { setChain, setConnectionStatus } from '../../../store/web3';
import { config } from '../../../config';

export interface PublicProperties {
  children?: React.ReactNode;
}

export interface Properties extends PublicProperties {
  setAddress: (address: string) => void;
  setChain: (chain: Chains) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export class Container extends React.Component<Properties> {
  private unwatch: () => void;

  static mapState(): Partial<Properties> {
    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setChain, setConnectionStatus };
  }

  componentDidMount(): void {
    this.watchConnection();
  }

  /**
   * Watch for changes in the user's web3 account.
   */
  watchConnection() {
    this.unwatch = watchAccount(getWagmiConfig(), {
      onChange: (account) => {
        this.props.setChain(account.chainId);

        if (!account.isConnected) {
          this.props.setConnectionStatus(ConnectionStatus.Disconnected);
        } else if (account.chainId?.toString() !== config.supportedChainId) {
          this.props.setConnectionStatus(ConnectionStatus.NetworkNotSupported);
        } else {
          this.props.setConnectionStatus(ConnectionStatus.Connected);
        }
      },
    });
  }

  componentWillUnmount(): void {
    if (this.unwatch) {
      this.unwatch();
    }
  }

  render() {
    return this.props.children;
  }
}

export const RainbowKitConnect = connectContainer<PublicProperties>(Container);
