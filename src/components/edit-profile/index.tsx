import * as React from 'react';

import { IconButton, Alert, Button, Input } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
import { ImageUpload } from '../../components/image-upload';
import { IconUpload2, IconXClose } from '@zero-tech/zui/icons';
import { State as EditProfileState } from '../../store/edit-profile';
import { FeatureFlag } from '../feature-flag';

const c = bem('edit-profile');

export interface Properties {
  editProfileState: EditProfileState;
  errors: {
    image?: string;
    name?: string;
    general?: string;
  };
  currentDisplayName: string;
  currentProfileImage: string;
  currentMatrixId: string;
  currentMatrixAccessToken: string;
  onEdit: (data: { name: string; image: File; matrixId: string; matrixAccessToken: string }) => void;
  onClose?: () => void;
}

interface State {
  name: string;
  image: File | null;
  matrixId: string;
  matrixAccessToken: string;
}

export class EditProfile extends React.Component<Properties, State> {
  state = {
    name: this.props.currentDisplayName,
    image: null,
    matrixId: this.props.currentMatrixId,
    matrixAccessToken: this.props.currentMatrixAccessToken,
  };

  handleEdit = () => {
    this.props.onEdit({
      name: this.state.name,
      image: this.state.image,
      matrixId: this.state.matrixId,
      matrixAccessToken: this.state.matrixAccessToken,
    });
  };

  trackName = (value) => this.setState({ name: value });
  trackImage = (image) => this.setState({ image });
  trackMatrixId = (matrixId) => this.setState({ matrixId });
  trackMatrixAccessToken = (matrixAccessToken) => this.setState({ matrixAccessToken });

  get isValid() {
    return this.state.name.trim().length > 0;
  }

  get nameError() {
    if (!this.isValid) {
      return { variant: 'error', text: 'name cannot be empty' } as any;
    }
    return null;
  }

  get generalError() {
    return this.props.errors.general;
  }

  get imageError() {
    return this.props.errors.image;
  }

  get isLoading() {
    return this.props.editProfileState === EditProfileState.INPROGRESS;
  }

  get changesSaved() {
    return this.props.editProfileState === EditProfileState.SUCCESS;
  }

  get isDisabled() {
    if (this.state.matrixId !== '' && this.state.matrixAccessToken !== '') {
      return false;
    }

    return (
      !!this.nameError ||
      this.isLoading ||
      (this.state.name === this.props.currentDisplayName && this.state.image === null)
    );
  }

  renderImageUploadIcon = (): JSX.Element => <IconUpload2 isFilled={true} />;

  render() {
    return (
      <div className={c('')}>
        <div className={c('header')}>
          <h3 className={c('title')}>Edit Profile</h3>
          <IconButton className={c('close')} Icon={IconXClose} onClick={this.props.onClose} size={32} />
        </div>
        <div className={c('body')}>
          <div className={c('image-upload')}>
            <ImageUpload
              onChange={this.trackImage}
              icon={this.renderImageUploadIcon()}
              uploadText='Select or drag and drop'
              isError={Boolean(this.props.errors.image)}
              errorMessage={this.props.errors.image}
              imageSrc={this.props.currentProfileImage} // to show the existing image
            />
          </div>
          <Input
            label='Display Name'
            name='name'
            value={this.state.name}
            onChange={this.trackName}
            error={!!this.nameError}
            alert={this.nameError}
            className={c('body-input')}
          />

          <FeatureFlag featureFlag='enableMatrix'>
            <Input
              label='Matrix ID'
              name='matrix_id'
              value={this.state.matrixId}
              onChange={this.trackMatrixId}
              className={c('body-input')}
            />
            <Input
              label='Matrix Access Token'
              name='access_token'
              value={this.state.matrixAccessToken}
              onChange={this.trackMatrixAccessToken}
              className={c('body-input')}
            />
          </FeatureFlag>
        </div>
        {this.imageError && (
          <Alert className={c('alert-large')} variant='error'>
            {this.imageError}
          </Alert>
        )}
        {this.generalError && (
          <Alert className={c('alert-large')} variant='error'>
            {this.generalError}
          </Alert>
        )}
        {this.changesSaved && (
          <Alert className={c('alert-large')} variant='success'>
            Your changes have been saved
          </Alert>
        )}
        <div className={c('footer')}>
          <Button
            className={c('zui-button-large')}
            isLoading={this.isLoading}
            isSubmit
            isDisabled={this.isDisabled}
            onPress={this.handleEdit}
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  }
}
