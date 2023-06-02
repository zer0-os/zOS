import * as React from 'react';

import { Connectors } from '../../lib/web3';
import { RootState } from '../../store/reducer';
import { loginByWeb3 } from '../../store/login';
import { connectContainer } from '../../store/redux-container';

import { Web3Login } from '.';
import { Web3Connect } from '../../components/web3-connect';

export interface Web3LoginContainerProperties {
  error: string;
  isConnecting: boolean;
  loginByWeb3: (connector: Connectors) => void;
}

export class Container extends React.Component<Web3LoginContainerProperties> {
  static mapState(state: RootState): Partial<Web3LoginContainerProperties> {
    const {
      web3: { value },
      login,
    } = state;

    return {
      error: value.error,
      isConnecting: login.loading,
    };
  }

  static mapActions(_props: Web3LoginContainerProperties): Partial<Web3LoginContainerProperties> {
    return { loginByWeb3 };
  }

  render() {
    return (
      <Web3Connect>
        <Web3Login error={this.props.error} isConnecting={this.props.isConnecting} onSelect={this.props.loginByWeb3} />
      </Web3Connect>
    );
  }
}

export const Web3LoginContainer = connectContainer<{}>(Container);
