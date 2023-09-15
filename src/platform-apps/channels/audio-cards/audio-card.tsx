import { IconTrash4 } from '@zero-tech/zui/icons';
import React from 'react';
import { IconButton } from '@zero-tech/zui/components';
import { AudioModel } from './types';

export interface Properties {
  audio: AudioModel;
  onRemove: () => void;
}

export default class AudioCard extends React.Component<Properties> {
  deleteIcon() {
    const { onRemove } = this.props;

    if (onRemove) {
      return (
        <div className='audio__cards-card__actions'>
          <IconButton onClick={onRemove} Icon={IconTrash4} size={28} className='audio__cards-card__actions-delete' />
        </div>
      );
    }
  }

  render() {
    const { audio } = this.props;

    return (
      <div className='audio__cards-card'>
        {this.deleteIcon()}
        <span className='audio__cards-card__preview'>
          <audio controls controlsList='nodownload nofullscreen noremoteplayback' className='audio__cards-card__audio'>
            <source src={audio.url} />
          </audio>
        </span>
      </div>
    );
  }
}
