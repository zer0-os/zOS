import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { SecureBackupContainer } from '../secure-backup/container';
import { closeBackupDialog } from '../../store/matrix';
import { LogoutConfirmationModalContainer } from '../logout-confirmation-modal/container';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  displayLogoutModal: boolean;
  isBackupDialogOpen: boolean;

  closeBackupDialog: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      authentication: { displayLogoutModal },
      matrix: { isBackupDialogOpen },
    } = state;

    return {
      displayLogoutModal,
      isBackupDialogOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { closeBackupDialog };
  }

  closeBackup = () => {
    this.props.closeBackupDialog();
  };

  renderSecureBackupDialog = (): JSX.Element => {
    return <SecureBackupContainer onClose={this.closeBackup} />;
  };

  renderLogoutDialog = (): JSX.Element => {
    return <LogoutConfirmationModalContainer />;
  };

  render() {
    return (
      <>
        {this.props.isBackupDialogOpen && this.renderSecureBackupDialog()}
        {this.props.displayLogoutModal && this.renderLogoutDialog()}
      </>
    );
  }
}

export const DialogManager = connectContainer<PublicProperties>(Container);
