import * as React from 'react';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';
import { Button } from '@zero-tech/zui/components';
import { User } from '../../../store/channels';
import { clipboard } from '../../../lib/clipboard';

const cn = bemClassName('dev-panel-encryption');

export interface Properties {
  userId: string;
  deviceId: string;
  roomId: string;
  otherMembers: User[];

  onDeviceList: () => void;
  onRoomKeys: () => void;
  onResendKeyRequests: () => void;
  onDiscardOLM: () => void;
  onRestartOLM: () => void;
  onShareHistoryKeys: (userIds: string[]) => void;
}

interface State {}

export class Encryption extends React.PureComponent<Properties, State> {
  render() {
    return (
      <div {...cn()}>
        <h2>Me</h2>
        <Field label={'id'} value={this.props.userId} />
        <Field label={'device'} value={this.props.deviceId} />

        <h2>Room</h2>
        <Field label={'id: '} value={this.props.roomId} />
        <h3>Other Members</h3>
        {this.props.otherMembers.map((member) => (
          <React.Fragment key={member.userId}>
            <Field label={member.firstName} value={member.matrixId} />
            <Button onPress={() => this.props.onShareHistoryKeys([member.matrixId])}>Share History Keys</Button>
          </React.Fragment>
        ))}

        <div {...cn('buttons')}>
          <Button onPress={this.props.onDeviceList}>Device List</Button>
          <Button onPress={this.props.onRoomKeys}>Room Keys</Button>
          <Button onPress={this.props.onResendKeyRequests}>Cancel And Resend Key Requests</Button>
          <Button onPress={this.props.onDiscardOLM}>Discard OLM Session</Button>
          <Button onPress={this.props.onRestartOLM}>Restart OLM Session</Button>
        </div>
      </div>
    );
  }
}

export class Field extends React.PureComponent<{ label: string; value: string }, State> {
  get clipboard() {
    return clipboard;
  }

  copyValue = () => {
    this.clipboard.write(this.props.value);
  };

  render() {
    return (
      <div {...cn('field')} onClick={this.copyValue}>
        <span {...cn('label')}> {this.props.label}: </span>
        <span {...cn('value')}> {this.props.value}</span>
      </div>
    );
  }
}
