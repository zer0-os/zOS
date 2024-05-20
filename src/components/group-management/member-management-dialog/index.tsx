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

class RemoveMember implements ConfirmationHandler {
  constructor(private userName, private roomLabel) {}

  getProgressMessage() {
    return `Removing ${this.userName} from ${this.roomLabel}.`;
  }

  getTitle() {
    return 'Remove Member';
  }

  getMessage() {
    return (
      <>
        Are you sure you want to remove {this.userName} from {this.roomLabel}?<br />
        {this.userName} will lose access to the conversation and its history.
      </>
    );
  }
}

interface ConfirmationHandler {
  getProgressMessage(): string;
  getTitle(): string;
  getMessage(): JSX.Element;
}

class MakeModerator implements ConfirmationHandler {
  constructor(private userName, private roomLabel) {}

  getProgressMessage() {
    return `Making ${this.userName} moderator of ${this.roomLabel}.`;
  }

  getTitle() {
    return 'Make Mod';
  }

  getMessage() {
    return (
      <>
        Are you sure you want to make <b>{this.userName}</b> moderator of <i>{this.roomLabel}</i>?
      </>
    );
  }
}

class Default implements ConfirmationHandler {
  constructor(private userName, private roomLabel) {}

  getProgressMessage() {
    return 'In Progress';
  }

  getTitle() {
    return 'Member Management';
  }

  getMessage() {
    return <>Are you sure you want to perform this action?</>;
  }
}

function getMemberManagementHandler(type: MemberManagementAction, userName: string, roomLabel: string) {
  let handlerClass;
  if (type === MemberManagementAction.RemoveMember) {
    handlerClass = RemoveMember;
  } else if (type === MemberManagementAction.MakeModerator) {
    handlerClass = MakeModerator;
  } else {
    handlerClass = Default;
  }

  return new handlerClass(userName, roomLabel);
}

export class MemberManagementDialog extends React.Component<Properties> {
  get roomLabel() {
    return this.props.roomName ? `${this.props.roomName}` : 'the group';
  }

  render() {
    const handler = getMemberManagementHandler(this.props.type, this.props.userName, this.roomLabel);

    return (
      <ModalConfirmation
        open
        title={handler.getTitle()}
        cancelLabel='Cancel'
        confirmationLabel={handler.getTitle()}
        onCancel={this.props.onClose}
        onConfirm={this.props.onConfirm}
        inProgress={this.props.inProgress}
      >
        <div {...cn()}>
          <div>{this.props.inProgress ? handler.getProgressMessage() : handler.getMessage()}</div>
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
