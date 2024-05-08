import React from 'react';
import { connectContainer } from '../../../store/redux-container';

import { UserProfile } from '.';

import { User } from '../../../store/channels';
import { RootState } from '../../../store/reducer';
import { getUserSubHandle } from '../../../lib/user';
import { currentUserSelector } from '../../../store/authentication/selectors';
import { closeUserProfile } from '../../../store/edit-profile';
import { logout } from '../../../store/authentication';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  currentUser: User;
  displayLogoutModal: boolean;

  logout: () => void;
  closeUserProfile: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { authentication } = state;
    const currentUser = currentUserSelector(state);

    return {
      currentUser: {
        firstName: currentUser?.profileSummary.firstName,
        profileImage: currentUser?.profileSummary.profileImage,
        displaySubHandle: getUserSubHandle(currentUser?.primaryZID, currentUser?.primaryWalletAddress),
      } as User,
      displayLogoutModal: authentication.displayLogoutModal,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      logout,
      closeUserProfile,
    };
  }

  render() {
    return (
      <UserProfile
        name={this.props.currentUser.firstName}
        image={this.props.currentUser.profileImage}
        subHandle={this.props.currentUser.displaySubHandle}
        isLogoutOpen={this.props.displayLogoutModal}
        onBack={this.props.closeUserProfile}
        onOpenLogoutDialog={this.props.logout}
      />
    );
  }
}

export const UserProfileContainer = connectContainer<PublicProperties>(Container);
