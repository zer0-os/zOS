import * as React from 'react';

import { IconButton, Alert, Button, Input, Tooltip, SelectInput } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
import { ImageUpload } from '../../components/image-upload';
import { IconUpload2, IconXClose, IconHelpCircle, IconCheck } from '@zero-tech/zui/icons';
import { State as EditProfileState } from '../../store/edit-profile';
import { featureFlags } from '../../lib/feature-flags';

const c = bem('edit-profile');

export interface Properties {
  editProfileState: EditProfileState;
  errors: {
    image?: string;
    name?: string;
    general?: string;
  };
  currentDisplayName: string;
  currentPrimaryZID: string;
  currentProfileImage: string;
  ownedZIDs: string[];
  onEdit: (data: { name: string; image: File; primaryZID: string }) => void;
  onClose?: () => void;

  onLeaveGlobal: () => void;
  onJoinGlobal: () => void;
}

interface State {
  name: string;
  image: File | null;
  primaryZID: string;
}

export class EditProfile extends React.Component<Properties, State> {
  state = {
    name: this.props.currentDisplayName,
    primaryZID: this.props.currentPrimaryZID,
    image: null,
  };

  handleEdit = () => {
    this.props.onEdit({
      name: this.state.name,
      image: this.state.image,
      primaryZID: this.state.primaryZID,
    });
  };

  trackName = (value) => this.setState({ name: value });
  trackImage = (image) => this.setState({ image });
  trackPrimaryZID = (value) => this.setState({ primaryZID: value });

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
    return (
      !!this.nameError ||
      this.isLoading ||
      (this.state.name === this.props.currentDisplayName &&
        this.state.image === null &&
        this.state.primaryZID === this.props.currentPrimaryZID)
    );
  }

  renderImageUploadIcon = (): JSX.Element => <IconUpload2 isFilled={true} />;

  renderZeroIDLabel = (): JSX.Element => (
    <div className={c('primary-zid-lable')}>
      Primary ZERO ID
      <Tooltip content='Your primary ZERO ID is displayed with your username and other members can find you by searching for it.'>
        <div className={c('info-tooltip')}>
          <IconHelpCircle size={16} />
        </div>
      </Tooltip>
    </div>
  );

  renderOwnedZIDItem(label, icon = null) {
    return (
      <div className={c('zid-menu-item-label')}>
        {label} {icon}
      </div>
    );
  }

  get menuItems() {
    const options = [];

    if (this.props.currentPrimaryZID) {
      options.push({
        id: this.props.currentPrimaryZID,
        label: this.renderOwnedZIDItem(this.props.currentPrimaryZID, <IconCheck size={24} />),
        onSelect: () => this.trackPrimaryZID(this.props.currentPrimaryZID),
      });
    }

    for (const zid of this.props.ownedZIDs) {
      if (zid === this.props.currentPrimaryZID) continue;

      options.push({
        id: zid,
        label: this.renderOwnedZIDItem(zid),
        onSelect: () => this.trackPrimaryZID(zid),
      });
    }
    return options;
  }

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
          {featureFlags.allowEditPrimaryZID && (
            <div className={c('body-input')}>
              {this.renderZeroIDLabel()}
              <SelectInput
                items={this.menuItems}
                label=''
                placeholder={this.props.currentPrimaryZID}
                value={this.state.primaryZID}
                className={c('select-input')}
              />
            </div>
          )}
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
          {featureFlags.internalUsage && (
            <>
              <Button className={c('zui-button-large')} onPress={this.props.onLeaveGlobal}>
                Leave Global
              </Button>
              <Button className={c('zui-button-large')} onPress={this.props.onJoinGlobal}>
                Join Global
              </Button>
            </>
          )}

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
