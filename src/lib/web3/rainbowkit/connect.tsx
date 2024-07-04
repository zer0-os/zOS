import * as React from 'react';

import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { watchAccount } from '@wagmi/core';
import { getWagmiConfig } from '../wagmi-config';
import { Chains, ConnectionStatus } from '..';
import { setAddress, setChain, setConnectionStatus } from '../../../store/web3';

export interface PublicProperties {
  children?: React.ReactNode;
}

export interface Properties extends PublicProperties {
  setAddress: (address: string) => void;
  setChain: (chain: Chains) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  web3: any;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      web3: state.web3,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setChain, setAddress, setConnectionStatus };
  }

  componentDidMount(): void {
    watchAccount(getWagmiConfig(), {
      onChange: (account) => {
        this.props.setChain(account.chainId);
        this.props.setAddress(account.address);

        if (account.chainId !== 1) {
          this.props.setConnectionStatus(ConnectionStatus.NetworkNotSupported);
        } else {
          this.props.setConnectionStatus(
            account.isConnected ? ConnectionStatus.Connected : ConnectionStatus.Disconnected
          );
        }
      },
    });
  }

  render() {
    return this.props.children;
  }
}

export const RainbowKitConnect = connectContainer<PublicProperties>(Container);
