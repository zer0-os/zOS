import React from 'react';
import { ReactMic } from 'react-mic';
import { IconCheck, IconTrash4 } from '@zero-tech/zui/icons';
import { IconButton } from '../icon-button';
import { Media } from '../message-input/utils';

import './styles.scss';

export interface Properties {
  onMediaSelected: (file: Media) => void;
  onClose: () => void;
}

export interface State {
  isMicRecording: boolean;
}

export default class MessageAudioRecorder extends React.Component<Properties, State> {
  constructor(props) {
    super(props);
    this.state = {
      isMicRecording: false,
    };
  }

  componentDidMount = () => {
    this.setState({
      isMicRecording: true,
    });
  };

  stopRecording = (): void => this.setState({ isMicRecording: false });

  onStopMic = (recordedBlob): void => {
    this.props.onMediaSelected({
      id: recordedBlob.blobURL,
      name: 'Recording',
      nativeFile: recordedBlob.blob,
      url: recordedBlob.blobURL,
      mediaType: 'audio',
    });
  };

  render() {
    return (
      <div className='message-audio-recorder'>
        <div className='message-audio-recorder__bar'>
          <div className='message-audio-recorder__icons'>
            <IconButton
              Icon={IconTrash4}
              onClick={this.props.onClose}
              className='message-audio-recorder__icons-delete'
            />
          </div>
          <div className='message-audio-recorder__recording'>
            <div className='message-audio-recorder__blip' />
          </div>
          <ReactMic
            record={this.state.isMicRecording}
            onStop={this.onStopMic}
            className='message-audio-recorder__visualizer'
            strokeColor='#A09FA6'
            backgroundColor='#141316'
            mimeType='audio/webm'
          />
          <div className='message-audio-recorder__icons'>
            <IconButton
              Icon={IconCheck}
              onClick={this.stopRecording}
              className='message-audio-recorder__icons-check'
            />
          </div>
        </div>
      </div>
    );
  }
}
