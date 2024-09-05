import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';

import { AccountManagementPanel } from './index';
import { openAddEmailAccountModal, closeAddEmailAccountModal, Errors } from '../../../../store/account-management';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { ConnectionStatus } from '../../../../lib/web3';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  isAddEmailModalOpen: boolean;
  error: string;
  successMessage: string;
  currentUser: any;
  canAddEmail: boolean;
  isWalletConnected: boolean;
  connectedWallet: string;

  openAddEmailAccountModal: () => void;
  closeAddEmailAccountModal: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      accountManagement,
      web3: { status, value },
    } = state;

    const currentUser = currentUserSelector(state);
    const primaryEmail = currentUser?.profileSummary.primaryEmail;

    return {
      error: Container.mapErrors(accountManagement.errors),
      successMessage: accountManagement.successMessage,
      isAddEmailModalOpen: accountManagement.isAddEmailAccountModalOpen,
      isWalletConnected: status === ConnectionStatus.Connected,
      connectedWallet: value?.address,
      currentUser: {
        userId: currentUser?.id,
        firstName: currentUser?.profileSummary.firstName,
        lastName: currentUser?.profileSummary.lastName,
        profileImage: currentUser?.profileSummary.profileImage,
        primaryEmail: currentUser?.profileSummary.primaryEmail,
        wallets: currentUser?.wallets || [],
      },
      canAddEmail: !primaryEmail,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      openAddEmailAccountModal,
      closeAddEmailAccountModal,
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
        isAddEmailModalOpen={this.props.isAddEmailModalOpen}
        currentUser={this.props.currentUser}
        canAddEmail={this.props.canAddEmail}
        isWalletConnected={this.props.isWalletConnected}
        connectedWallet={this.props.connectedWallet}
        onOpenAddEmailModal={() => this.props.openAddEmailAccountModal()}
        onCloseAddEmailModal={() => this.props.closeAddEmailAccountModal()}
        onBack={this.props.onClose}
      />
    );
  }
}

export const AccountManagementContainer = connectContainer<PublicProperties>(Container);
