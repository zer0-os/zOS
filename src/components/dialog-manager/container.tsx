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
import { ReportUserContainer } from '../report-user-dialog/container';
import { closeReportUserModal } from '../../store/report-user';
export interface PublicProperties {}

export interface Properties extends PublicProperties {
  displayLogoutModal: boolean;
  isBackupDialogOpen: boolean;
  isRewardsDialogOpen: boolean;
  isReportUserModalOpen: boolean;
  deleteMessageId: number;

  closeBackupDialog: () => void;
  closeRewardsDialog: () => void;
  closeDeleteMessage: () => void;
  closeReportUserModal: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      authentication: { displayLogoutModal },
      matrix: { isBackupDialogOpen },
      dialogs: { deleteMessageId },
      reportUser: { isReportUserModalOpen },
      rewards,
    } = state;

    return {
      displayLogoutModal,
      isBackupDialogOpen,
      isRewardsDialogOpen: rewards.showRewardsInPopup,
      deleteMessageId,
      isReportUserModalOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { closeBackupDialog, closeRewardsDialog, closeDeleteMessage, closeReportUserModal };
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

  closeReportUserModal = () => {
    this.props.closeReportUserModal();
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

  renderReportUserDialog = (): JSX.Element => {
    return <ReportUserContainer onClose={this.closeReportUserModal} />;
  };

  render() {
    return (
      <>
        {this.props.isBackupDialogOpen && this.renderSecureBackupDialog()}
        {this.props.displayLogoutModal && this.renderLogoutDialog()}
        {this.props.isRewardsDialogOpen && this.renderRewardsDialog()}
        {this.props.deleteMessageId && this.renderDeleteMessageDialog()}
        {this.props.isReportUserModalOpen && this.renderReportUserDialog()}
      </>
    );
  }
}

export const DialogManager = connectContainer<PublicProperties>(Container);
