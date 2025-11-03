import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { CreateSecureBackupContainer } from '../secure-backup/create-secure-backup/container';
import { RestoreSecureBackupContainer } from '../secure-backup/restore-secure-backup/container';
import { closeCreateBackupDialog, closeRestoreBackupDialog } from '../../store/matrix';
import { LogoutConfirmationModalContainer } from '../logout-confirmation-modal/container';
import { RewardsModalContainer } from '../rewards-modal/container';
import { closeRewardsDialog } from '../../store/rewards';
import { DeleteMessageContainer } from '../delete-message-dialog/container';
import { closeDeleteMessage, closeLightbox } from '../../store/dialogs';
import { ReportUserContainer } from '../report-user-dialog/container';
import { closeReportUserModal } from '../../store/report-user';
import { Lightbox } from '../lightbox';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  displayLogoutModal: boolean;
  isCreateBackupDialogOpen: boolean;
  isRestoreBackupDialogOpen: boolean;
  isRewardsDialogOpen: boolean;
  isReportUserModalOpen: boolean;
  deleteMessageId: string;
  lightbox: {
    isOpen: boolean;
    media: any[];
    startingIndex: number;
    hasActions?: boolean;
  };

  closeCreateBackupDialog: () => void;
  closeRestoreBackupDialog: () => void;
  closeRewardsDialog: () => void;
  closeDeleteMessage: () => void;
  closeReportUserModal: () => void;
  closeLightbox: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      authentication: { displayLogoutModal },
      matrix: { isCreateBackupDialogOpen, isRestoreBackupDialogOpen },
      dialogs: { deleteMessageId, lightbox },
      reportUser: { isReportUserModalOpen },
      rewards,
    } = state;

    return {
      displayLogoutModal,
      isCreateBackupDialogOpen,
      isRestoreBackupDialogOpen,
      isRewardsDialogOpen: rewards.showRewardsInPopup,
      deleteMessageId,
      isReportUserModalOpen,
      lightbox,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      closeCreateBackupDialog,
      closeRestoreBackupDialog,
      closeRewardsDialog,
      closeDeleteMessage,
      closeReportUserModal,
      closeLightbox,
    };
  }

  closeCreateBackup = () => {
    this.props.closeCreateBackupDialog();
  };

  closeRestoreBackup = () => {
    this.props.closeRestoreBackupDialog();
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

  closeLightbox = () => {
    this.props.closeLightbox();
  };

  renderCreateBackupDialog = (): JSX.Element => {
    return <CreateSecureBackupContainer onClose={this.closeCreateBackup} />;
  };

  renderRestoreBackupDialog = (): JSX.Element => {
    return <RestoreSecureBackupContainer onClose={this.closeRestoreBackup} />;
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

  renderLightbox = (): JSX.Element => {
    return (
      <Lightbox
        items={this.props.lightbox.media}
        startingIndex={this.props.lightbox.startingIndex}
        hasActions={this.props.lightbox.hasActions}
        onClose={this.closeLightbox}
      />
    );
  };

  render() {
    return (
      <>
        {this.props.isCreateBackupDialogOpen && this.renderCreateBackupDialog()}
        {this.props.isRestoreBackupDialogOpen && this.renderRestoreBackupDialog()}
        {this.props.displayLogoutModal && this.renderLogoutDialog()}
        {this.props.isRewardsDialogOpen && this.renderRewardsDialog()}
        {this.props.deleteMessageId && this.renderDeleteMessageDialog()}
        {this.props.isReportUserModalOpen && this.renderReportUserDialog()}
        {this.props.lightbox.isOpen && this.renderLightbox()}
      </>
    );
  }
}

export const DialogManager = connectContainer<PublicProperties>(Container);
