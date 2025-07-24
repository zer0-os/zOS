import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';

import { AccountManagementPanel } from './index';
import { reset, Errors, addNewWallet, State } from '../../../../store/account-management';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { Wallet } from '../../../../store/authentication/types';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  error: string;
  successMessage: string;
  wallets: Wallet[];
  connectedWalletAddr: string;
  addWalletState: State;

  addNewWallet: () => void;
  onReset: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      accountManagement,
      web3: { value },
    } = state;

    const currentUser = currentUserSelector(state);

    return {
      error: Container.mapErrors(accountManagement.errors),
      successMessage: accountManagement.successMessage,
      connectedWalletAddr: value?.address,
      addWalletState: accountManagement.state,
      wallets: currentUser?.wallets || [],
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      addNewWallet,
      onReset: reset,
    };
  }

  static mapErrors(errors: string[]) {
    if (!errors || errors.length === 0) {
      return '';
    }
    const error = errors[0];
    if (error === Errors.UNKNOWN_ERROR) {
      return 'An unknown error occurred. Please try again';
    }
    return error;
  }

  render() {
    return (
      <AccountManagementPanel
        error={this.props.error}
        successMessage={this.props.successMessage}
        wallets={this.props.wallets}
        connectedWalletAddr={this.props.connectedWalletAddr}
        addWalletState={this.props.addWalletState}
        onAddNewWallet={this.props.addNewWallet}
        onBack={this.props.onClose}
        reset={this.props.onReset}
      />
    );
  }
}

export const AccountManagementContainer = connectContainer<PublicProperties>(Container);
