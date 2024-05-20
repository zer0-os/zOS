import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { SecureBackupContainer } from '../secure-backup/container';
import { closeBackupDialog } from '../../store/matrix';
import { LogoutConfirmationModalContainer } from '../logout-confirmation-modal/container';
import { RewardsModalContainer } from '../rewards-modal/container';
import { closeRewardsDialog } from '../../store/rewards';
import { DeleteMessageContainer } from '../delete-message-dialog/container';
import { closeDeleteMessage } from '../../store/dialogs';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  displayLogoutModal: boolean;
  isBackupDialogOpen: boolean;
  isRewardsDialogOpen: boolean;
  deleteMessageId: number;

  closeBackupDialog: () => void;
  closeRewardsDialog: () => void;
  closeDeleteMessage: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      authentication: { displayLogoutModal },
      matrix: { isBackupDialogOpen },
      dialogs: { deleteMessageId },
      rewards,
    } = state;

    return {
      displayLogoutModal,
      isBackupDialogOpen,
      isRewardsDialogOpen: rewards.showRewardsInPopup,
      deleteMessageId,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { closeBackupDialog, closeRewardsDialog, closeDeleteMessage };
  }

  closeBackup = () => {
    this.props.closeBackupDialog();
  };

  closeRewards = () => {
    this.props.closeRewardsDialog();
  };

  closeDeleteMessage = () => {
    this.props.closeDeleteMessage();
  };

  renderSecureBackupDialog = (): JSX.Element => {
    return <SecureBackupContainer onClose={this.closeBackup} />;
  };

  renderLogoutDialog = (): JSX.Element => {
    return <LogoutConfirmationModalContainer />;
  };

  renderRewardsDialog = (): JSX.Element => {
    return <RewardsModalContainer onClose={this.closeRewards} />;
  };

  renderDeleteMessageDialog = (): JSX.Element => {
    return <DeleteMessageContainer onClose={this.closeDeleteMessage} />;
  };

  render() {
    return (
      <>
        {this.props.isBackupDialogOpen && this.renderSecureBackupDialog()}
        {this.props.displayLogoutModal && this.renderLogoutDialog()}
        {this.props.isRewardsDialogOpen && this.renderRewardsDialog()}
        {this.props.deleteMessageId && this.renderDeleteMessageDialog()}
      </>
    );
  }
}

export const DialogManager = connectContainer<PublicProperties>(Container);
