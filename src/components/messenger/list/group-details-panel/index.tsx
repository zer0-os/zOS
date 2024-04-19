import * as React from 'react';

import { Option } from '../../lib/types';
import { PanelHeader } from '../panel-header';
import { ImageUpload } from '../../../image-upload';
import { SelectedUserTag } from '../selected-user-tag';
import { Button, Input } from '@zero-tech/zui/components';
import { IconImagePlus, IconMessagePlusSquare } from '@zero-tech/zui/icons';

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

  renderImageUploadIcon = (): JSX.Element => <IconImagePlus />;

  render() {
    return (
      <div {...cn('')}>
        <PanelHeader title='Group Details' onBack={this.props.onBack} />

        <div {...cn('details-content')}>
          <div>
            <div {...cn('field-info')}>
              <span {...cn('label')}>Group name</span>
              <span {...cn('optional')}>Optional</span>
            </div>
            <Input value={this.state.name} onChange={this.nameChanged} />
          </div>

          <div {...cn('field-info-container')}>
            <div {...cn('field-info')}>
              <span {...cn('label')}>Group image</span>
              <span {...cn('optional')}>Optional</span>
            </div>
            <ImageUpload
              onChange={this.onImageChange}
              {...cn('image-upload')}
              icon={this.renderImageUploadIcon()}
              uploadText={'Upload image'}
            />
          </div>

          <div {...cn('selected-container')}>
            <div {...cn('selected-count')}>
              <span {...cn('selected-number')}>{this.props.users.length}</span> member
              {this.props.users.length === 1 ? '' : 's'} selected
            </div>
            <div {...cn('selected-tags')}>
              {this.props.users.map((u) => (
                <SelectedUserTag userOption={u} key={u.value}></SelectedUserTag>
              ))}
            </div>
          </div>

          <Button
            {...cn('create')}
            onPress={this.createGroup}
            startEnhancer={<IconMessagePlusSquare isFilled size={18} />}
          >
            Create Group
          </Button>
        </div>
      </div>
    );
  }
}
