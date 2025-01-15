import { IconTrash4 } from '@zero-tech/zui/icons';
import React from 'react';
import { IconButton } from '@zero-tech/zui/components';
import { AudioModel } from './types';
import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('audio-card');

export interface Properties {
  audio: AudioModel;
  onRemove: () => void;
}

export default class AudioCard extends React.Component<Properties> {
  deleteIcon() {
    const { onRemove } = this.props;

    if (onRemove) {
      return (
        <div {...cn('actions')}>
          <IconButton onClick={onRemove} Icon={IconTrash4} size={20} {...cn('actions-delete')} />
        </div>
      );
    }
  }

  render() {
    const { audio } = this.props;

    return (
      <div {...cn()}>
        {this.deleteIcon()}
        <div {...cn('block-audio')}>
          <audio controls controlsList='nodownload nofullscreen noplaybackrate'>
            <source src={audio.url} />
          </audio>
        </div>
      </div>
    );
  }
}
