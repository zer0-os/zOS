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
    this.props.onCreate({ name: this.state.name, users: this.props.users, image: this.state.image });
  };

  nameChanged = (value) => {
    this.setState({ name: value });
  };

  onImageChange = (image) => {
    this.setState({ image });
  };

  back = () => {
    this.props.onBack();
  };

  renderImageUploadIcon = (): JSX.Element => <IconImagePlus />;

  render() {
    return (
      <div {...cn('')}>
        <PanelHeader title='Group Details' onBack={this.back} />

        <div {...cn('body')}>
          <ImageUpload onChange={this.onImageChange} icon={this.renderImageUploadIcon()} />

          <Input
            value={this.state.name}
            onChange={this.nameChanged}
            {...cn('name-input')}
            placeholder='Group name...'
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
          <Button {...cn('create-button')} onPress={this.createGroup}>
            Create Group
          </Button>
        </div>
      </div>
    );
  }
}
