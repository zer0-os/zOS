import * as React from 'react';

import { Option } from '../../lib/types';
import { PanelHeader } from '../panel-header';
import { ImageUpload } from '../../../image-upload';
import { SelectedUserTag } from '../selected-user-tag';
import { Alert, Button, IconButton, Input } from '@zero-tech/zui/components';
import { IconCheck, IconImagePlus, IconPlus } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './group-details-panel.scss';

const cn = bemClassName('group-details-panel');

export interface Properties {
  users: Option[];

  onBack: () => void;
  onCreate: (data: { name: string; users: Option[]; image: File; isSocialChannel: boolean }) => void;
}

interface State {
  name: string;
  image: File | null;
  isSocialChannel: boolean;
}

export class GroupDetailsPanel extends React.Component<Properties, State> {
  state = { name: '', image: null, isSocialChannel: false };

  createGroup = () => {
    this.props.onCreate({
      name: this.state.name,
      users: this.props.users,
      image: this.state.image,
      isSocialChannel: this.state.isSocialChannel,
    });
  };

  nameChanged = (value) => {
    this.setState({ name: value });
  };

  onImageChange = (image) => {
    this.setState({ image });
  };

  onSocialChannelChange = (event) => {
    this.setState({ isSocialChannel: event.target.checked });
  };

  back = () => {
    this.props.onBack();
  };

  renderImageUploadIcon = (): JSX.Element => <IconImagePlus />;

  render() {
    const isDisabled = !this.state.name || this.state.name.trim().length === 0;
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

          <div {...cn('checkbox-container')}>
            Group Options
            <label {...cn('checkbox-label-wrapper')}>
              <input
                {...cn('checkbox')}
                type='checkbox'
                checked={this.state.isSocialChannel}
                onChange={this.onSocialChannelChange}
              />
              {this.state.isSocialChannel && <IconCheck {...cn('checkbox-icon')} size={14} isFilled />}
              Social Channel
            </label>
            <Alert {...cn('alert')} variant='info'>
              Social Channels are designed to accommodate larger communities and are not encrypted by default.
            </Alert>
            <Alert {...cn('alert')} variant='info'>
              If your room is for social or public interaction, consider using this option.
            </Alert>
            <Alert {...cn('alert')} variant='info'>
              Check this box if you are creating a room intended for larger groups (10+ people).
            </Alert>
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
