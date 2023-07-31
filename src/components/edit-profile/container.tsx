import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { EditProfile } from '.';
import { editProfile, startProfileEdit } from '../../store/edit-profile';
import { Container as RegistrationContainer } from '../../authentication/create-account-details/container';
export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  errors: {
    image?: string;
    name?: string;
    general?: string;
  };
  changesSaved: boolean;
  currentDisplayName: string;
  currentProfileImage: string;
  editProfile: (data: { name: string; image: File }) => void;
  startProfileEdit: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      editProfile,
      authentication: { user },
    } = state;
    return {
      isLoading: editProfile.loading,
      errors: RegistrationContainer.mapErrors(editProfile.errors),
      changesSaved: editProfile.changesSaved,
      currentDisplayName: user?.data?.profileSummary.firstName,
      currentProfileImage: user?.data?.profileSummary.profileImage,
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
        isLoading={this.props.isLoading}
        onEdit={this.props.editProfile}
        errors={this.props.errors}
        onClose={this.props.onClose}
        changesSaved={this.props.changesSaved}
        currentDisplayName={this.props.currentDisplayName}
        currentProfileImage={this.props.currentProfileImage}
      />
    );
  }
}

export const EditProfileContainer = connectContainer<PublicProperties>(Container);
