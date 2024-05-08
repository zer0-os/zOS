import * as React from 'react';

import { PanelHeader } from '../../list/panel-header';
import { bemClassName } from '../../../../lib/bem';
import { Input, Alert } from '@zero-tech/zui/components';
import { Button } from '@zero-tech/zui/components/Button';
import { ImageUpload } from '../../../image-upload';
import { IconUpload2 } from '@zero-tech/zui/icons';
import { User } from '../../../../store/channels';
import { CitizenListItem } from '../../../citizen-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { EditConversationErrors, EditConversationState } from '../../../../store/group-management/types';
import { sortMembers } from '../../list/utils/utils';

import './styles.scss';

const cn = bemClassName('edit-conversation-panel');

export interface Properties {
  name: string;
  icon: string;
  currentUser: User;
  otherMembers: User[];
  errors: EditConversationErrors;
  state: EditConversationState;
  conversationAdminIds: string[];

  onBack: () => void;
  onRemoveMember: (userId: string) => void;
  onEdit: (name: string, image: File | null) => void;
  onMemberSelected: (userId: string) => void;
  openUserProfile: () => void;
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

  trackName = (value) => this.setState({ name: value });
  trackImage = (image) => this.setState({ image });
  renderImageUploadIcon = (): JSX.Element => <IconUpload2 isFilled={true} />;

  handleEdit = () => {
    this.props.onEdit(this.state.name, this.state.image);
  };

  get generalError() {
    return this.props.errors?.general;
  }

  get isDisabled() {
    return this.isLoading || (this.state.name === this.props.name && this.state.image === null);
  }

  get isLoading() {
    return this.props.state === EditConversationState.INPROGRESS;
  }

  get changesSaved() {
    return this.props.state === EditConversationState.SUCCESS;
  }

  get removeMember() {
    if (this.props.otherMembers.length < 2) return null;

    return this.publishRemove;
  }

  publishRemove = (userId: string) => {
    this.props.onRemoveMember(userId);
  };

  memberSelected = (userId: string) => {
    this.props.onMemberSelected(userId);
  };

  openProfile = () => {
    this.props.openUserProfile();
  };

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
          name='name'
          value={this.state.name}
          onChange={this.trackName}
          placeholder='Group name...'
          {...cn('body-input')}
        />

        {this.generalError && (
          <Alert {...cn('alert')} variant='error' isFilled>
            {this.generalError}
          </Alert>
        )}
        {this.changesSaved && (
          <Alert {...cn('alert')} variant='success' isFilled>
            Changes saved
          </Alert>
        )}

        <Button
          {...cn('zui-button-large')}
          isSubmit
          isLoading={this.isLoading}
          isDisabled={this.isDisabled}
          onPress={this.handleEdit}
        >
          Save
        </Button>
      </div>
    );
  };

  renderMembers = () => {
    const { conversationAdminIds, otherMembers } = this.props;
    const sortedOtherMembers = sortMembers(otherMembers, conversationAdminIds);

    return (
      <div {...cn('members')}>
        <div {...cn('member-header')}>
          <span>{otherMembers.length + 1}</span> member{otherMembers.length + 1 === 1 ? '' : 's'}
        </div>
        <div {...cn('member-list')}>
          <ScrollbarContainer>
            <CitizenListItem user={this.props.currentUser} tag='Admin' onSelected={this.openProfile}></CitizenListItem>
            {sortedOtherMembers.map((u) => (
              <CitizenListItem
                key={u.userId}
                user={u}
                onRemove={this.removeMember}
                onSelected={this.memberSelected}
              ></CitizenListItem>
            ))}
          </ScrollbarContainer>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div {...cn()}>
        <PanelHeader title={'Edit Group'} onBack={this.props.onBack} />
        <div {...cn('body')}>
          {this.renderEditImageAndIcon()}
          {this.renderMembers()}
        </div>
      </div>
    );
  }
}
