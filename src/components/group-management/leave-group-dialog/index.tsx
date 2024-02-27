import * as React from 'react';

import { IconButton, Button } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import './styles.scss';

import { bemClassName } from '../../../lib/bem';
import { LeaveGroupDialogStatus } from '../../../store/group-management';
import { Modal } from '../../modal';

const cn = bemClassName('leave-group-dialog');

export interface Properties {
  name: string;
  status: LeaveGroupDialogStatus;

  onClose: () => void;
  onLeave: () => void;
}

interface State {}

export class LeaveGroupDialog extends React.Component<Properties, State> {
  render() {
    return (
      <Modal
        title='Leave Group?'
        onClose={this.props.onClose}
        primaryText='Leave Group'
        secondaryText='Cancel'
        onPrimary={this.props.onLeave}
        onSecondary={this.props.onClose}
        // isLoading={this.props.status === LeaveGroupDialogStatus.IN_PROGRESS}
      >
        <div {...cn('')}>
          Are you sure you want to leave {this.props.name || 'this group'}? You will lose access to the conversation and
          its history.
        </div>
      </Modal>
    );
  }
}
