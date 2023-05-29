import React from 'react';

import { connectContainer } from '../../store/redux-container';
import { Connectors } from '../../lib/web3';
import { AccountCreationErrors, createWeb3Account } from '../../store/registration';

import { CreateWalletAccount } from '.';
import { RootState } from '../../store/reducer';
import { Web3Connect } from '../../components/web3-connect';

export interface Properties {
  // XXX: simplify even further to just a single error
  errors: {
    general: string;
  };
  isConnecting: boolean;

  createWeb3Account: (payload: { connector: Connectors }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      web3: { value },
      registration: { errors, loading },
    } = state;

    return {
      errors: { general: value.error || Container.mapErrors(errors) },
      isConnecting: loading,
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
      return 'This address has already been registered';
    }
    // XXX: debugging - render the error message raw
    return error;
  }

  connectorSelected = async (connector) => {
    this.props.createWeb3Account({ connector });
  };

  render() {
    return (
      <>
        <Web3Connect>
          <CreateWalletAccount
            onSelect={this.connectorSelected}
            error={this.props.errors.general}
            isConnecting={this.props.isConnecting}
          />
        </Web3Connect>
      </>
    );
  }
}

export const CreateWalletAccountContainer = connectContainer<{}>(Container);
