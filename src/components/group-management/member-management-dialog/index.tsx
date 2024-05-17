import * as React from 'react';

import { Alert, ModalConfirmation } from '@zero-tech/zui/components';

import './styles.scss';

import { bemClassName } from '../../../lib/bem';
import { MemberManagementAction } from '../../../store/group-management';

const cn = bemClassName('remove-member-dialog');

export interface Properties {
  type: MemberManagementAction;
  userName: string;
  roomName: string;
  inProgress: boolean;
  error: string;

  onClose: () => void;
  onConfirm: () => void;
}

export class MemberManagementDialog extends React.Component<Properties> {
  get roomLabel() {
    return this.props.roomName ? `${this.props.roomName}` : 'the group';
  }

  get progressMessage() {
    if (this.props.type === MemberManagementAction.RemoveMember) {
      return `Removing ${this.props.userName} from ${this.roomLabel}.`;
    } else if (this.props.type === MemberManagementAction.MakeModerator) {
      return `Making ${this.props.userName} a moderator of ${this.roomLabel}.`;
    }

    return 'in progress';
  }

  get message() {
    if (this.props.type === MemberManagementAction.RemoveMember) {
      return (
        <>
          Are you sure you want to remove {this.props.userName} from {this.roomLabel}?<br />
          {this.props.userName} will lose access to the conversation and its history.
        </>
      );
    }

    if (this.props.type === MemberManagementAction.MakeModerator) {
      return (
        <>
          Are you sure you want to make <i>{this.props.userName}</i> a moderator of <i>{this.roomLabel}</i>?
        </>
      );
    }

    return 'Are you sure you want to perform this action?';
  }

  get title() {
    if (this.props.type === MemberManagementAction.RemoveMember) {
      return 'Remove Member';
    }

    if (this.props.type === MemberManagementAction.MakeModerator) {
      return 'Make Mod';
    }

    return 'Member Management';
  }

  render() {
    return (
      <ModalConfirmation
        open
        title={this.title}
        cancelLabel='Cancel'
        confirmationLabel={this.title}
        onCancel={this.props.onClose}
        onConfirm={this.props.onConfirm}
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
