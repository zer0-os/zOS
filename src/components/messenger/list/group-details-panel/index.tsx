import * as React from 'react';

import { Option } from '../../lib/types';
import { PanelHeader } from '../panel-header';
import { ImageUpload } from '../../../image-upload';
import { SelectedUserTag } from '../selected-user-tag';
import { Button, IconButton, Input } from '@zero-tech/zui/components';
import { IconImagePlus, IconPlus } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './group-details-panel.scss';

const cn = bemClassName('group-details-panel');

export interface Properties {
  users: Option[];
  onBack: () => void;
  onCreate: (data: { name: string; users: Option[]; image: File }) => void;
}

interface State {
  name: string;
  image: File | null;
}

export class GroupDetailsPanel extends React.Component<Properties, State> {
  state = { name: '', image: null };

  createGroup = () => {
    if (this.isNameValid) {
      this.props.onCreate({ name: this.state.name, users: this.props.users, image: this.state.image });
    }
  };

  nameChanged = (value) => this.setState({ name: value });
  onImageChange = (image) => this.setState({ image });
  back = () => this.props.onBack();

  get isNameValid() {
    const { name } = this.state;
    return typeof name === 'string' && name.trim().length > 0;
  }

  renderImageUploadIcon = (): JSX.Element => <IconImagePlus />;

  render() {
    const { name } = this.state;

    return (
      <div {...cn('')}>
        <PanelHeader title='Group Details' onBack={this.back} />

        <div {...cn('body')}>
          <ImageUpload onChange={this.onImageChange} icon={this.renderImageUploadIcon()} />

          <Input
            value={name}
            onChange={this.nameChanged}
            placeholder='Group name...'
            isRequired={true}
            error={!this.isNameValid}
            alert={!this.isNameValid ? { variant: 'error', text: 'Please enter a group name.' } : undefined}
            {...cn('name-input')}
          />

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
          <Button {...cn('create-button')} onPress={this.createGroup} isDisabled={!this.isNameValid}>
            Create Group
          </Button>
        </div>
      </div>
    );
  }
}
