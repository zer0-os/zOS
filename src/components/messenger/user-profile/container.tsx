import React from 'react';
import { connectContainer } from '../../../store/redux-container';

import { UserProfile } from '.';

import { User } from '../../../store/channels';
import { RootState } from '../../../store/reducer';
import { getUserSubHandle } from '../../../lib/user';
import { currentUserSelector } from '../../../store/authentication/selectors';
import { closeUserProfile } from '../../../store/edit-profile';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  currentUser: User;

  closeUserProfile: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const currentUser = currentUserSelector(state);

    return {
      currentUser: {
        firstName: currentUser?.profileSummary.firstName,
        profileImage: currentUser?.profileSummary.profileImage,
        displaySubHandle: getUserSubHandle(currentUser?.primaryZID, currentUser?.primaryWalletAddress),
      } as User,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      closeUserProfile,
    };
  }

  render() {
    return (
      <UserProfile
        name={this.props.currentUser.firstName}
        image={this.props.currentUser.profileImage}
        subHandle={this.props.currentUser.displaySubHandle}
        onBack={this.props.closeUserProfile}
      />
    );
  }
}

export const UserProfileContainer = connectContainer<PublicProperties>(Container);
