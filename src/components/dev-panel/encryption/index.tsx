import * as React from 'react';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';
import { Button } from '@zero-tech/zui/components';
import { User } from '../../../store/channels';

const cn = bemClassName('dev-panel-encryption');

export interface Properties {
  userId: string;
  deviceId: string;
  roomId: string;
  otherMembers: User[];

  onDeviceListRequested: () => void;
  onRoomKeysRequested: () => void;
}

interface State {}

export class Encryption extends React.Component<Properties, State> {
  render() {
    return (
      <>
        <h2>Me</h2>
        <div {...cn('my-id')}>Id: {this.props.userId}</div>
        <br />
        <div {...cn('my-device')}>Device: {this.props.deviceId}</div>

        <h2>Room</h2>
        <div {...cn('room-id')}>{this.props.roomId}</div>
        <h3>Other Members</h3>
        {this.props.otherMembers.map((member) => (
          <div key={member.userId} {...cn('room-member')}>
            {member.firstName} - {member.matrixId}
          </div>
        ))}

        <h2>Print to Console</h2>
        <Button onPress={this.props.onDeviceListRequested}>Device List</Button>
        <Button onPress={this.props.onRoomKeysRequested}>Room Keys</Button>
      </>
    );
  }
}
