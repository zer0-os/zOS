import * as React from 'react';

import { Option } from '../../lib/types';
import { PanelHeader } from '../panel-header';
import { ImageUpload } from '../../../image-upload';
import { SelectedUserTag } from '../selected-user-tag';
import { Button, IconButton, Input } from '@zero-tech/zui/components';
import { IconImagePlus, IconPlus } from '@zero-tech/zui/icons';
import { GroupTypeMenu } from './group-type-menu';

import { bemClassName } from '../../../../lib/bem';
import './group-details-panel.scss';

const cn = bemClassName('group-details-panel');

export interface Properties {
  users: Option[];

  onBack: () => void;
  onCreate: (data: { name: string; users: Option[]; image: File; groupType: string }) => void;
  onOpenGroupTypeDialog: () => void;
}

interface State {
  name: string;
  image: File | null;
  selectedGroupType: string;
}

export enum GroupType {
  ENCRYPTED = 'encrypted',
  SUPER = 'super',
}

export class GroupDetailsPanel extends React.Component<Properties, State> {
  state = { name: '', image: null, selectedGroupType: '' };

  createGroup = () => {
    this.props.onCreate({
      name: this.state.name,
      users: this.props.users,
      image: this.state.image,
      groupType: this.state.selectedGroupType,
    });
  };

  nameChanged = (value) => {
    this.setState({ name: value });
  };

  onImageChange = (image) => {
    this.setState({ image });
  };

  groupTypeChange = (type: string) => {
    this.setState({ selectedGroupType: type });
  };

  back = () => {
    this.props.onBack();
  };

  openGroupTypeDialog = () => {
    this.props.onOpenGroupTypeDialog();
  };

  renderImageUploadIcon = (): JSX.Element => <IconImagePlus />;

  render() {
    const isDisabled = !this.state.name || this.state.name.trim().length === 0 || this.state.selectedGroupType === '';
    return (
      <div {...cn('')}>
        <PanelHeader title='Group Details' onBack={this.back} />

        <div {...cn('body')}>
          <ImageUpload onChange={this.onImageChange} icon={this.renderImageUploadIcon()} />

          <Input
            value={this.state.name}
            onChange={this.nameChanged}
            {...cn('name-input')}
            placeholder='Group Name (Required)'
            autoFocus
          />

          <GroupTypeMenu onSelect={this.groupTypeChange} onOpen={this.openGroupTypeDialog} />

          <div {...cn('selected-container')}>
            <div {...cn('selected-header')}>
              <span {...cn('selected-count')}>
                {this.props.users.length} member{this.props.users.length === 1 ? '' : 's'}:
              </span>

              <IconButton Icon={IconPlus} onClick={this.back} size={32} />
            </div>

            <div {...cn('selected-tags')}>
              {this.props.users.map((u) => (
                <SelectedUserTag userOption={u} key={u.value}></SelectedUserTag>
              ))}
            </div>
          </div>
        </div>

        <div {...cn('footer')}>
          <Button {...cn('create-button')} onPress={this.createGroup} isDisabled={isDisabled}>
            Create Group
          </Button>
        </div>
      </div>
    );
  }
}
