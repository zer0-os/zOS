import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { SecureBackupContainer } from '../secure-backup/container';
import { closeBackupDialog } from '../../store/matrix';
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
  isBackupDialogOpen: boolean;
  isRewardsDialogOpen: boolean;
  isReportUserModalOpen: boolean;
  deleteMessageId: number;
  lightbox: {
    isOpen: boolean;
    media: any[];
    startingIndex: number;
  };

  closeBackupDialog: () => void;
  closeRewardsDialog: () => void;
  closeDeleteMessage: () => void;
  closeReportUserModal: () => void;
  closeLightbox: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      authentication: { displayLogoutModal },
      matrix: { isBackupDialogOpen },
      dialogs: { deleteMessageId, lightbox },
      reportUser: { isReportUserModalOpen },
      rewards,
    } = state;

    return {
      displayLogoutModal,
      isBackupDialogOpen,
      isRewardsDialogOpen: rewards.showRewardsInPopup,
      deleteMessageId,
      isReportUserModalOpen,
      lightbox,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { closeBackupDialog, closeRewardsDialog, closeDeleteMessage, closeReportUserModal, closeLightbox };
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

  closeLightbox = () => {
    this.props.closeLightbox();
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

  renderLightbox = (): JSX.Element => {
    return (
      <Lightbox
        // since we are displaying images from a local blob url (instead of a cloudinary url),
        // we need to provide a custom provider which just returns the src directly.
        provider={{
          fitWithinBox: () => {},
          getSource: ({ src }) => src,
        }}
        items={this.props.lightbox.media}
        startingIndex={this.props.lightbox.startingIndex}
        onClose={this.closeLightbox}
      />
    );
  };

  render() {
    return (
      <>
        {this.props.isBackupDialogOpen && this.renderSecureBackupDialog()}
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
