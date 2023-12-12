import * as React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { RemoveMemberDialog } from '.';
import { denormalize as denormalizeUser } from '../../../store/users';
import { displayName } from '../../../lib/user';
import { denormalize as denormalizeChannel } from '../../../store/channels';
import { cancelRemoveMember, removeMember, RemoveMemberDialogStage } from '../../../store/group-management';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  userId: string;
  roomId: string;
  userName: string;
  roomName: string;
  stage: RemoveMemberDialogStage;
  error: string;

  cancel: () => void;
  remove: (userId: string, roomId: string) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      groupManagement: { removeMember },
    } = state;
    const user = denormalizeUser(removeMember.userId, state);
    const channel = denormalizeChannel(removeMember.roomId, state);

    return {
      userId: removeMember.userId,
      roomId: removeMember.roomId,
      stage: removeMember.stage,
      error: removeMember.error,
      userName: displayName(user),
      roomName: channel?.name,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      cancel: cancelRemoveMember,
      remove: (userId, roomId) => removeMember({ userId, roomId }),
    };
  }

  remove = (): void => {
    this.props.remove(this.props.userId, this.props.roomId);
  };

  render() {
    if (this.props.stage === RemoveMemberDialogStage.CLOSED) {
      return null;
    }

    return (
      <RemoveMemberDialog
        userName={this.props.userName}
        roomName={this.props.roomName}
        inProgress={this.props.stage === RemoveMemberDialogStage.IN_PROGRESS}
        error={this.props.error}
        onClose={this.props.cancel}
        onRemove={this.remove}
      />
    );
  }
}
export const RemoveMemberDialogContainer = connectContainer<PublicProperties>(Container);
