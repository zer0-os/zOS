/**
 * The purpose of this component is to listen for changes in the user's account,
 * and update the Redux store accordingly.
 */

import * as React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { watchAccount } from '@wagmi/core';
import { getWagmiConfig } from '../wagmi-config';
import { Chains, ConnectionStatus } from '..';
import { setChain, setConnectionStatus, setAddress } from '../../../store/web3';
import { RootState } from '../../../store';

export interface PublicProperties {
  children?: React.ReactNode;
}

export interface Properties extends PublicProperties {
  address: string;

  setAddress: (address: string) => void;
  setChain: (chain: Chains) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export class Container extends React.Component<Properties> {
  private unwatch: () => void;

  static mapState(state: RootState): Partial<Properties> {
    const {
      web3: { value },
    } = state;

    return {
      address: value.address,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setChain, setConnectionStatus, setAddress };
  }

  componentDidMount(): void {
    this.watchConnection();
  }

  /**
   * Check if the given chain ID is supported by the application.
   */
  isSupportedChain(chainId: number | undefined): boolean {
    if (!chainId) return false;
    const supportedChains = [1, 11155111, 43113]; // mainnet, sepolia, avalanche fuji
    return supportedChains.includes(chainId);
  }

  /**
   * Watch for changes in the user's web3 account.
   */
  watchConnection() {
    this.unwatch = watchAccount(getWagmiConfig(), {
      onChange: (account, prevAccount) => {
        this.props.setChain(account.chainId);
        // note: this is commented out but we should fix the saga logic to handle this
        // this.props.updateConnector(account.connector.name);

        if (!account.isConnected) {
          this.props.setConnectionStatus(ConnectionStatus.Disconnected);
        } else if (!this.isSupportedChain(account.chainId)) {
          this.props.setConnectionStatus(ConnectionStatus.NetworkNotSupported);
        } else {
          this.props.setConnectionStatus(ConnectionStatus.Connected);
          if (!this.props.address) {
            this.props.setAddress(account.address);
          } else if (account.address && prevAccount?.address !== account.address) {
            this.props.setAddress(account.address); // new wallet connected
          }
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
