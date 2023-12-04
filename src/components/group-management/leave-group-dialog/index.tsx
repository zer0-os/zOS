import * as React from 'react';

import { IconButton, Button } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import './styles.scss';

import { bemClassName } from '../../../lib/bem';
import { LeaveGroupDialogStatus } from '../../../store/group-management';

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
      <div {...cn('')}>
        <div {...cn('title-bar')}>
          <h3 {...cn('title')}>Leave Group ?</h3>
          <IconButton {...cn('close')} size='large' Icon={IconXClose} onClick={this.props.onClose} />
        </div>

        <div {...cn('body')}>
          Are you sure you want to leave {this.props.name || 'this group'}? You will lose access to the conversation and
          its history.
        </div>

        <div {...cn('footer')}>
          <Button {...cn('text-button')} variant='text' onPress={this.props.onClose}>
            <div {...cn('text-button-text')}>Cancel</div>
          </Button>

          <Button
            {...cn('text-button')}
            variant='negative'
            onPress={this.props.onLeave}
            isLoading={this.props.status === LeaveGroupDialogStatus.IN_PROGRESS}
          >
            <div {...cn('text-button-text')}>Leave Group</div>
          </Button>
        </div>
      </div>
    );
  }
}
