import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';

import { AccountManagementPanel } from './index';
import { Connectors } from '../../../../lib/web3';
import {
  addNewWallet,
  openWalletSelectModal,
  closeWalletSelectModal,
  openAddEmailAccountModal,
  closeAddEmailAccountModal,
  Errors,
} from '../../../../store/account-management';
import { currentUserSelector } from '../../../../store/authentication/selectors';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  isModalOpen: boolean;
  isAddEmailModalOpen: boolean;
  error: string;
  currentUser: any;
  canAddEmail: boolean;

  addNewWallet: (payload: { connector: Connectors }) => void;
  openWalletSelectModal: () => void;
  closeWalletSelectModal: () => void;
  openAddEmailAccountModal: () => void;
  closeAddEmailAccountModal: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { accountManagement } = state;

    const currentUser = currentUserSelector(state);
    const primaryEmail = currentUser?.profileSummary.primaryEmail;

    return {
      error: Container.mapErrors(accountManagement.errors),
      isModalOpen: accountManagement.isWalletSelectModalOpen,
      isAddEmailModalOpen: accountManagement.isAddEmailAccountModalOpen,
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
      addNewWallet,
      openWalletSelectModal,
      closeWalletSelectModal,
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

  connectorSelected = async (connector) => {
    this.props.addNewWallet({ connector });
  };

  render() {
    return (
      <AccountManagementPanel
        error={this.props.error}
        isModalOpen={this.props.isModalOpen}
        isAddEmailModalOpen={this.props.isAddEmailModalOpen}
        currentUser={this.props.currentUser}
        canAddEmail={this.props.canAddEmail}
        onSelect={this.connectorSelected}
        onOpenModal={() => this.props.openWalletSelectModal()}
        onCloseModal={() => this.props.closeWalletSelectModal()}
        onOpenAddEmailModal={() => this.props.openAddEmailAccountModal()}
        onCloseAddEmailModal={() => this.props.closeAddEmailAccountModal()}
        onBack={this.props.onClose}
      />
    );
  }
}

export const AccountManagementContainer = connectContainer<PublicProperties>(Container);
