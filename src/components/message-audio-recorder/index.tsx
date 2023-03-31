import React from 'react';
import { RecordState } from 'audio-react-recorder-fixed';
import { IconCheck, IconTrash4 } from '@zero-tech/zui/icons';
import { IconButton } from '../icon-button';
import { Media } from '../message-input/utils';

import './styles.scss';

const AudioReactRecorder = require('audio-react-recorder-fixed').default;

export interface Properties {
  onMediaSelected: (file: Media) => void;
  onClose: () => void;
}

export interface State {
  isMicRecording: RecordState;
  isMicAllowed: boolean;
}

export default class MessageAudioRecorder extends React.Component<Properties, State> {
  constructor(props) {
    super(props);
    this.state = {
      isMicRecording: null,
      isMicAllowed: false,
    };
  }

  componentDidMount = () => {
    this.checkPermissions();
  };

  checkPermissions = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        this.setState({ isMicAllowed: true });
        this.setState({
          isMicRecording: RecordState.START,
        });
      })
      .catch(() => {
        this.setState({ isMicAllowed: false });
      });
  };

  stopRecording = (): void => this.setState({ isMicRecording: RecordState.STOP });

  onStopMic = (recordedBlob): void => {
    this.props.onMediaSelected({
      id: recordedBlob.url,
      name: 'Recording',
      nativeFile: recordedBlob.blob,
      url: recordedBlob.url,
      mediaType: 'audio',
    });
  };

  render() {
    if (!this.state.isMicAllowed) return null;

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
          <AudioReactRecorder
            state={this.state.isMicRecording}
            onStop={this.onStopMic}
            foregroundColor='#A09FA6'
            backgroundColor='#141316'
            canvasWidth='auto'
            canvasHeight='20'
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
