import * as React from 'react';

import { PanelHeader } from '../panel-header';
import { bemClassName } from '../../../../lib/bem';
import { Input, Button, Alert } from '@zero-tech/zui/components';
import { ImageUpload } from '../../../image-upload';
import { IconUpload2 } from '@zero-tech/zui/icons';
import { User } from '../../../../store/channels';
import { CitizenListItem } from '../../../citizen-list-item';

import './styles.scss';
import { EditConversationErrors } from '../../../../store/group-management/types';
const cn = bemClassName('edit-conversation-panel');

export interface Properties {
  name: string;
  icon: string;
  currentUser: User;
  otherMembers: User[];
  errors: EditConversationErrors;

  onBack: () => void;
}

interface State {
  name: string;
  image: File | null;
}

export class EditConversationPanel extends React.Component<Properties, State> {
  state = {
    name: this.props.name || '',
    image: null,
  };

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
    return this.props.errors?.general;
  }

  trackName = (value) => this.setState({ name: value });
  trackImage = (image) => this.setState({ image });
  renderImageUploadIcon = (): JSX.Element => <IconUpload2 isFilled={true} />;

  handleEdit = () => {
    // do edit here
  };

  get isDisabled() {
    return !!this.nameError || (this.state.name === this.props.name && this.state.image === null);
  }

  get changesSaved() {
    return false;
  }

  renderEditImageAndIcon = () => {
    return (
      <div {...cn('details')}>
        <div {...cn('image-upload')}>
          <ImageUpload
            onChange={this.trackImage}
            icon={this.renderImageUploadIcon()}
            uploadText='Select or drag and drop'
            imageSrc={this.props.icon} // to show the existing image
            isError={Boolean(this.props.errors?.image)}
            errorMessage={this.props.errors?.image}
          />
        </div>

        <Input
          label='Display Name'
          name='name'
          value={this.state.name}
          onChange={this.trackName}
          error={!!this.nameError}
          alert={this.nameError}
          {...cn('body-input')}
        />

        {this.generalError && (
          <Alert {...cn('alert')} variant='error'>
            {this.generalError}
          </Alert>
        )}
        {this.changesSaved && (
          <Alert {...cn('alert')} variant='success'>
            {' '}
            Changes saved{' '}
          </Alert>
        )}

        <Button {...cn('zui-button-large')} isSubmit isDisabled={this.isDisabled} onPress={this.handleEdit}>
          Save
        </Button>
      </div>
    );
  };

  renderMembers = () => {
    const { otherMembers } = this.props;
    return (
      <div {...cn('members')}>
        <div {...cn('member-header')}>
          <span>{otherMembers.length + 1}</span> member{otherMembers.length + 1 === 1 ? '' : 's'}
        </div>
        <div {...cn('member-list')}>
          <CitizenListItem user={this.props.currentUser}></CitizenListItem>
          {otherMembers.map((u) => (
            <CitizenListItem key={u.userId} user={u}></CitizenListItem>
          ))}
        </div>
      </div>
    );
  };

  render() {
    return (
      <>
        <PanelHeader title={'Edit Group'} onBack={this.props.onBack} />
        <div {...cn('body')}>
          {this.renderEditImageAndIcon()}
          {this.renderMembers()}
        </div>
      </>
    );
  }
}
