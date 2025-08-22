import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';

import { AccountManagementPanel } from './index';
import {
  reset,
  Errors,
  addNewWallet,
  State,
  removeWallet,
  confirmRemoveWallet,
  closeRemoveWalletModal,
  setAddWalletCanAuthenticate,
  confirmAddNewWallet,
  setAddWalletRequiresTransferConfirmation,
  fetchWallets,
} from '../../../../store/account-management';
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
  zeroWalletAddress: string;
  isRemoveWalletModalOpen: boolean;
  walletIdPendingRemoval?: string;
  removeRequiresTransferConfirmation: boolean;
  isRemovingWallet: boolean;
  addWalletCanAuthenticate: boolean;
  addWalletRequiresTransferConfirmation: boolean;

  addNewWallet: () => void;
  fetchWallets: () => void;
  onReset: () => void;
  onRemoveWallet: (walletId: string) => void;
  onConfirmRemoveWallet: (confirm?: boolean) => void;
  onCloseRemoveWalletModal: () => void;
  onToggleAddWalletCanAuthenticate: (value: boolean) => void;
  onConfirmAddNewWallet: () => void;
  onCloseLinkNewWalletModal: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      accountManagement,
      web3: { value },
    } = state;

    return {
      error: Container.mapErrors(accountManagement.errors),
      successMessage: accountManagement.successMessage,
      connectedWalletAddr: value?.address,
      addWalletState: accountManagement.state,
      wallets: accountManagement.wallets,
      zeroWalletAddress: currentUserSelector(state)?.zeroWalletAddress,
      isRemoveWalletModalOpen: accountManagement.isRemoveWalletModalOpen,
      walletIdPendingRemoval: accountManagement.walletIdPendingRemoval,
      removeRequiresTransferConfirmation: accountManagement.removeRequiresTransferConfirmation,
      isRemovingWallet: accountManagement.isRemovingWallet,
      addWalletCanAuthenticate: accountManagement.addWalletCanAuthenticate,
      addWalletRequiresTransferConfirmation: accountManagement.addWalletRequiresTransferConfirmation,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      addNewWallet,
      fetchWallets,
      onReset: reset,
      onRemoveWallet: (walletId: string) => removeWallet({ walletId }),
      onConfirmRemoveWallet: confirmRemoveWallet,
      onCloseRemoveWalletModal: closeRemoveWalletModal,
      onToggleAddWalletCanAuthenticate: setAddWalletCanAuthenticate,
      onConfirmAddNewWallet: confirmAddNewWallet,
      onCloseLinkNewWalletModal: () => setAddWalletRequiresTransferConfirmation(false),
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

  componentDidMount(): void {
    this.props.fetchWallets();
  }

  render() {
    return (
      <AccountManagementPanel
        error={this.props.error}
        successMessage={this.props.successMessage}
        wallets={this.props.wallets}
        connectedWalletAddr={this.props.connectedWalletAddr}
        addWalletState={this.props.addWalletState}
        zeroWalletAddress={this.props.zeroWalletAddress}
        onAddNewWallet={this.props.addNewWallet}
        onBack={this.props.onClose}
        reset={this.props.onReset}
        onRemoveWallet={this.props.onRemoveWallet}
        isRemoveWalletModalOpen={this.props.isRemoveWalletModalOpen}
        walletIdPendingRemoval={this.props.walletIdPendingRemoval}
        removeRequiresTransferConfirmation={this.props.removeRequiresTransferConfirmation}
        isRemovingWallet={this.props.isRemovingWallet}
        onConfirmRemoveWallet={this.props.onConfirmRemoveWallet}
        onCloseRemoveWalletModal={this.props.onCloseRemoveWalletModal}
        addWalletCanAuthenticate={this.props.addWalletCanAuthenticate}
        addWalletRequiresTransferConfirmation={this.props.addWalletRequiresTransferConfirmation}
        onToggleAddWalletCanAuthenticate={this.props.onToggleAddWalletCanAuthenticate}
        onConfirmAddNewWallet={this.props.onConfirmAddNewWallet}
        onCloseLinkNewWalletModal={this.props.onCloseLinkNewWalletModal}
      />
    );
  }
}

export const AccountManagementContainer = connectContainer<PublicProperties>(Container);
