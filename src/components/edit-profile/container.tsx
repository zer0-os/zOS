import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { EditProfile } from '.';
import { State, editProfile, startProfileEdit } from '../../store/edit-profile';
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
  editProfile: (data: { name: string; image: File; matrixId: string; matrixAccessToken: string }) => void;
  startProfileEdit: () => void;
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
      editProfileState: editProfile.state,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { editProfile, startProfileEdit };
  }

  componentDidMount(): void {
    this.props.startProfileEdit();
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
      />
    );
  }
}

export const EditProfileContainer = connectContainer<PublicProperties>(Container);
