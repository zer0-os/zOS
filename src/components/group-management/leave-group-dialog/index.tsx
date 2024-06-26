import * as React from 'react';

import './styles.scss';

import { bemClassName } from '../../../lib/bem';
import { LeaveGroupDialogStatus } from '../../../store/group-management';
import { Color, Modal, Variant } from '../../modal';

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
        primaryText='Leave Group'
        primaryVariant={Variant.Primary}
        primaryColor={Color.Red}
        secondaryText='Cancel'
        secondaryVariant={Variant.Secondary}
        secondaryColor={Color.Greyscale}
        onPrimary={this.props.onLeave}
        onSecondary={this.props.onClose}
        onClose={this.props.onClose}
        isProcessing={this.props.status === LeaveGroupDialogStatus.IN_PROGRESS}
      >
        <div {...cn('')}>
          Are you sure you want to leave {this.props.name || 'this group'}? You will lose access to the conversation and
          its history.
        </div>
      </Modal>
    );
  }
}
