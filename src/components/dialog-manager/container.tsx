import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { SecureBackupContainer } from '../secure-backup/container';
import { closeBackupDialog } from '../../store/matrix';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  isBackupDialogOpen: boolean;

  closeBackupDialog: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      matrix: { isBackupDialogOpen },
    } = state;

    return {
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

  render() {
    return <>{this.props.isBackupDialogOpen && this.renderSecureBackupDialog()}</>;
  }
}

export const DialogManager = connectContainer<PublicProperties>(Container);
