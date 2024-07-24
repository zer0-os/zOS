import * as React from 'react';

import { ConnectionStatus } from '../../lib/web3';
import { RootState } from '../../store/reducer';
import { loginByWeb3 } from '../../store/login';
import { connectContainer } from '../../store/redux-container';

import { Web3Login } from '.';

export interface Web3LoginContainerProperties {
  error: string;
  isConnecting: boolean;
  loginByWeb3: () => void;
  isWalletConnected: boolean;
}

export class Container extends React.Component<Web3LoginContainerProperties> {
  static mapState(state: RootState): Partial<Web3LoginContainerProperties> {
    const {
      login: { errors, loading },
      web3: { status },
    } = state;

    return {
      // @note: casting here as there's only one error at a time when logging in via web3
      error: errors?.[0],
      isConnecting: loading,
      isWalletConnected: status === ConnectionStatus.Connected,
    };
  }

  static mapActions(_props: Web3LoginContainerProperties): Partial<Web3LoginContainerProperties> {
    return { loginByWeb3 };
  }

  render() {
    return (
      <Web3Login
        error={this.props.error}
        isConnecting={this.props.isConnecting}
        isWalletConnected={this.props.isWalletConnected}
        onSelect={this.props.loginByWeb3}
      />
    );
  }
}

export const Web3LoginContainer = connectContainer<{}>(Container);
