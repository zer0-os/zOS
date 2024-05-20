import * as React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { MemberManagementDialog } from '.';
import { denormalize as denormalizeUser } from '../../../store/users';
import { displayName } from '../../../lib/user';
import { denormalize as denormalizeChannel } from '../../../store/channels';
import {
  cancelMemberManagement,
  removeMember,
  MemberManagementDialogStage,
  MemberManagementAction,
  setMemberAsModerator,
} from '../../../store/group-management';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  type: MemberManagementAction;
  stage: MemberManagementDialogStage;
  userId: string;
  roomId: string;
  userName: string;
  roomName: string;
  error: string;

  cancel: () => void;
  remove: (userId: string, roomId: string) => void;
  setAsMod: (userId: string, roomId: string) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      groupManagement: { memberManagement },
    } = state;
    const user = denormalizeUser(memberManagement.userId, state);
    const channel = denormalizeChannel(memberManagement.roomId, state);

    return {
      type: memberManagement.type,
      userId: memberManagement.userId,
      roomId: memberManagement.roomId,
      stage: memberManagement.stage,
      error: memberManagement.error,
      userName: displayName(user),
      roomName: channel?.name,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      cancel: cancelMemberManagement,
      remove: (userId, roomId) => removeMember({ userId, roomId }),
      setAsMod: (userId, roomId) => setMemberAsModerator({ userId, roomId }),
    };
  }

  onConfirm = (): void => {
    if (this.props.type === MemberManagementAction.RemoveMember) {
      this.props.remove(this.props.userId, this.props.roomId);
    }

    if (this.props.type === MemberManagementAction.MakeModerator) {
      this.props.setAsMod(this.props.userId, this.props.roomId);
    }
  };

  render() {
    if (this.props.stage === MemberManagementDialogStage.CLOSED) {
      return null;
    }

    return (
      <MemberManagementDialog
        type={this.props.type}
        userName={this.props.userName}
        roomName={this.props.roomName}
        inProgress={this.props.stage === MemberManagementDialogStage.IN_PROGRESS}
        error={this.props.error}
        onClose={this.props.cancel}
        onConfirm={this.onConfirm}
      />
    );
  }
}
export const MemberManagementDialogContainer = connectContainer<PublicProperties>(Container);
