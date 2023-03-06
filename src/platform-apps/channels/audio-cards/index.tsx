import React from 'react';

import AudioCard from './audio-card';
import { AudioModel } from './types';

import './styles.scss';

export interface Properties {
  audios: AudioModel[];
  onRemove: (audio: AudioModel) => void;
}

export default class AudioCards extends React.Component<Properties, undefined> {
  itemRemoved = (image) => {
    const { onRemove } = this.props;

    if (onRemove) {
      return () => {
        onRemove(image);
      };
    }
  };

  render() {
    const { audios } = this.props;

    if (audios.length === 0) {
      return null;
    }

    return (
      <div className='audio__cards'>
        {audios.map((a) => (
          <AudioCard
            key={a.id}
            audio={a}
            onRemove={this.itemRemoved(a)}
          />
        ))}
      </div>
    );
  }
}
