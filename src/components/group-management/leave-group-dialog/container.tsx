import * as React from 'react';
import { LeaveGroupDialog } from '.';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { LeaveGroupDialogStatus, leaveGroup } from '../../../store/group-management';

export interface PublicProperties {
  groupName: string;
  roomId: string;

  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  status: LeaveGroupDialogStatus;

  leaveGroup: (roomId: string) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { groupManagement } = state;

    return {
      status: groupManagement.leaveGroupDialogStatus,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      leaveGroup: (roomId: string) => leaveGroup({ roomId }),
    };
  }

  onLeave() {
    this.props.leaveGroup(this.props.roomId);
  }

  render() {
    return (
      <LeaveGroupDialog
        name={this.props.groupName}
        status={this.props.status}
        onClose={this.props.onClose}
        onLeave={() => this.onLeave()}
      />
    );
  }
}

export const LeaveGroupDialogContainer = connectContainer<PublicProperties>(Container);
