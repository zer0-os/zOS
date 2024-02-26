import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { EditProfile } from '.';
import {
  State,
  editProfile,
  joinGlobalNetwork,
  leaveGlobalNetwork,
  startProfileEdit,
  fetchOwnedZIDs,
} from '../../store/edit-profile';
import { Container as RegistrationContainer } from '../../authentication/create-account-details/container';
export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  errors: {
    image?: string;
    name?: string;
    general?: string;
  };
  editProfileState: State;
  currentDisplayName: string;
  currentProfileImage: string;
  currentPrimaryZID: string;
  ownedZIDs: string[];
  loadingZIDs: boolean;
  editProfile: (data: { name: string; image: File; primaryZID: string }) => void;
  startProfileEdit: () => void;
  leaveGlobalNetwork: () => void;
  joinGlobalNetwork: () => void;
  fetchOwnedZIDs: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      editProfile,
      authentication: { user },
    } = state;
    return {
      errors: RegistrationContainer.mapErrors(editProfile.errors),
      currentDisplayName: user?.data?.profileSummary.firstName,
      currentProfileImage: user?.data?.profileSummary.profileImage,
      currentPrimaryZID: user?.data?.primaryZID,
      ownedZIDs: editProfile.ownedZIDs,
      editProfileState: editProfile.state,
      loadingZIDs: editProfile.loadingZIDs,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { editProfile, startProfileEdit, joinGlobalNetwork, leaveGlobalNetwork, fetchOwnedZIDs };
  }

  componentDidMount(): void {
    this.props.startProfileEdit();
    this.props.fetchOwnedZIDs();
  }

  render() {
    return (
      <EditProfile
        onEdit={this.props.editProfile}
        errors={this.props.errors}
        onClose={this.props.onClose}
        editProfileState={this.props.editProfileState}
        currentDisplayName={this.props.currentDisplayName}
        currentProfileImage={this.props.currentProfileImage}
        currentPrimaryZID={this.props.currentPrimaryZID}
        ownedZIDs={this.props.ownedZIDs}
        loadingZIDs={this.props.loadingZIDs}
        onLeaveGlobal={this.props.leaveGlobalNetwork}
        onJoinGlobal={this.props.joinGlobalNetwork}
      />
    );
  }
}

export const EditProfileContainer = connectContainer<PublicProperties>(Container);
