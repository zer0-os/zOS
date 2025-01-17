import React from 'react';
import { connectContainer } from '../../../store/redux-container';

import { UserProfile } from '.';

import { User } from '../../../store/channels';
import { RootState } from '../../../store/reducer';
import { getUserSubHandle } from '../../../lib/user';
import { currentUserSelector } from '../../../store/authentication/selectors';
import {
  Stage,
  closeUserProfile,
  openEditProfile,
  openUserProfile,
  openSettings,
  openDownloads,
  openAccountManagement,
  openLinkedAccounts,
} from '../../../store/user-profile';
import { logout } from '../../../store/authentication';
import { openBackupDialog } from '../../../store/matrix';
import { openRewardsDialog } from '../../../store/rewards';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  currentUser: User;
  stage: Stage;

  logout: () => void;
  openBackupDialog: () => void;
  openUserProfile: () => void;
  closeUserProfile: () => void;
  openEditProfile: () => void;
  openRewardsDialog: () => void;
  openSettings: () => void;
  openDownloads: () => void;
  openAccountManagement: () => void;
  openLinkedAccounts: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { userProfile } = state;
    const currentUser = currentUserSelector(state);

    return {
      currentUser: {
        firstName: currentUser?.profileSummary.firstName,
        profileImage: currentUser?.profileSummary.profileImage,
        displaySubHandle: getUserSubHandle(currentUser?.primaryZID, currentUser?.primaryWalletAddress),
      } as User,
      stage: userProfile.stage,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      logout,
      openUserProfile,
      closeUserProfile,
      openBackupDialog,
      openEditProfile,
      openRewardsDialog,
      openSettings,
      openDownloads,
      openAccountManagement,
      openLinkedAccounts,
    };
  }

  render() {
    return (
      <UserProfile
        stage={this.props.stage}
        name={this.props.currentUser.firstName}
        image={this.props.currentUser.profileImage}
        subHandle={this.props.currentUser.displaySubHandle}
        onClose={this.props.closeUserProfile}
        onLogout={this.props.logout}
        onBackup={this.props.openBackupDialog}
        onEdit={this.props.openEditProfile}
        onBackToOverview={this.props.openUserProfile}
        onRewards={this.props.openRewardsDialog}
        onSettings={this.props.openSettings}
        onDownloads={this.props.openDownloads}
        onManageAccounts={this.props.openAccountManagement}
        onOpenLinkedAccounts={this.props.openLinkedAccounts}
      />
    );
  }
}

export const UserProfileContainer = connectContainer<PublicProperties>(Container);
