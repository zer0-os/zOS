import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { SecureBackupContainer } from '../secure-backup/container';
import { closeBackupDialog } from '../../store/matrix';
import { LogoutConfirmationModalContainer } from '../logout-confirmation-modal/container';
import { RewardsModalContainer } from '../rewards-modal/container';
import { closeRewardsDialog } from '../../store/rewards';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  displayLogoutModal: boolean;
  isBackupDialogOpen: boolean;
  isRewardsDialogOpen: boolean;

  closeBackupDialog: () => void;
  closeRewardsDialog: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      authentication: { displayLogoutModal },
      matrix: { isBackupDialogOpen },
      rewards,
    } = state;

    return {
      displayLogoutModal,
      isBackupDialogOpen,
      isRewardsDialogOpen: rewards.showRewardsInPopup,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { closeBackupDialog, closeRewardsDialog };
  }

  closeBackup = () => {
    this.props.closeBackupDialog();
  };

  closeRewards = () => {
    this.props.closeRewardsDialog();
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

  render() {
    return (
      <>
        {this.props.isBackupDialogOpen && this.renderSecureBackupDialog()}
        {this.props.displayLogoutModal && this.renderLogoutDialog()}
        {this.props.isRewardsDialogOpen && this.renderRewardsDialog()}
      </>
    );
  }
}

export const DialogManager = connectContainer<PublicProperties>(Container);
