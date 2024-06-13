import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';

import { AccountManagementPanel } from './index';
import { Connectors } from '../../../../lib/web3';
import {
  addNewWallet,
  openWalletSelectModal,
  closeWalletSelectModal,
  Errors,
} from '../../../../store/account-management';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  isModalOpen: boolean;
  error: string;

  addNewWallet: (payload: { connector: Connectors }) => void;
  openWalletSelectModal: () => void;
  closeWalletSelectModal: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { accountManagement } = state;

    return {
      error: Container.mapErrors(accountManagement.errors),
      isModalOpen: accountManagement.isWalletSelectModalOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { addNewWallet, openWalletSelectModal, closeWalletSelectModal };
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
        onSelect={this.connectorSelected}
        onOpenModal={() => this.props.openWalletSelectModal()}
        onCloseModal={() => this.props.closeWalletSelectModal()}
        onBack={this.props.onClose}
      />
    );
  }
}

export const AccountManagementContainer = connectContainer<PublicProperties>(Container);
