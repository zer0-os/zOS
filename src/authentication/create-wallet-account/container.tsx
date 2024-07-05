import React from 'react';

import { connectContainer } from '../../store/redux-container';
import { AccountCreationErrors, createWeb3Account } from '../../store/registration';

import { CreateWalletAccount } from '.';
import { RootState } from '../../store/reducer';
import { ConnectionStatus } from '../../lib/web3';

export interface Properties {
  error: string;
  isConnecting: boolean;
  isWalletConnected: boolean;

  createWeb3Account: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      registration,
      web3: { status },
    } = state;

    return {
      error: Container.mapErrors(registration.errors),
      isConnecting: registration.loading,
      isWalletConnected: status === ConnectionStatus.Connected,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { createWeb3Account };
  }

  static mapErrors(errors: string[]) {
    if (!errors) {
      return '';
    }
    const error = errors[0];
    if (error === AccountCreationErrors.PUBLIC_ADDRESS_ALREADY_EXISTS) {
      return 'The wallet you connected is already associated with a ZERO account. Please try a different wallet or log in instead.';
    }
    return error;
  }

  connectorSelected = async () => {
    this.props.createWeb3Account();
  };

  render() {
    return (
      <CreateWalletAccount
        onSelect={this.connectorSelected}
        error={this.props.error}
        isConnecting={this.props.isConnecting}
        isWalletConnected={this.props.isWalletConnected}
      />
    );
  }
}

export const CreateWalletAccountContainer = connectContainer<{}>(Container);
