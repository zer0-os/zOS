import * as React from 'react';

import { Alert, ModalConfirmation } from '@zero-tech/zui/components';

import './styles.scss';

import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('remove-member-dialog');

export interface Properties {
  userName: string;
  roomName: string;
  inProgress: boolean;
  error: string;

  onClose: () => void;
  onRemove: () => void;
}

export class RemoveMemberDialog extends React.Component<Properties> {
  get roomLabel() {
    return this.props.roomName ? `${this.props.roomName}` : 'the group';
  }

  get progressMessage() {
    return `Removing ${this.props.userName} from ${this.roomLabel}.`;
  }

  get message() {
    return (
      <>
        Are you sure you want to remove {this.props.userName} from {this.roomLabel}?<br />
        {this.props.userName} will lose access to the conversation and its history.
      </>
    );
  }

  render() {
    return (
      <ModalConfirmation
        open
        title='Remove Member'
        cancelLabel='Cancel'
        confirmationLabel='Remove Member'
        onCancel={this.props.onClose}
        onConfirm={this.props.onRemove}
        inProgress={this.props.inProgress}
      >
        <div {...cn()}>
          <div>{this.props.inProgress ? this.progressMessage : this.message}</div>
          {this.props.error && (
            <Alert variant='error' isFilled>
              {this.props.error}
            </Alert>
          )}
        </div>
      </ModalConfirmation>
    );
  }
}
