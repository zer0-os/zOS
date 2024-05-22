import * as React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { ConfirmationDefinition, MemberManagementDialog } from '.';
import { denormalize as denormalizeUser } from '../../../store/users';
import { displayName } from '../../../lib/user';
import { denormalize as denormalizeChannel } from '../../../store/channels';
import {
  cancelMemberManagement,
  removeMember,
  MemberManagementDialogStage,
  MemberManagementAction,
  setMemberAsModerator,
  removeMemberAsModerator,
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
  removeAsMod: (userId: string, roomId: string) => void;
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
      removeAsMod: (userId, roomId) => removeMemberAsModerator({ userId, roomId }),
    };
  }

  get roomLabel() {
    return this.props.roomName ? `${this.props.roomName}` : 'the group';
  }

  onConfirm = (): void => {
    if (this.props.type === MemberManagementAction.RemoveMember) {
      this.props.remove(this.props.userId, this.props.roomId);
    }

    if (this.props.type === MemberManagementAction.MakeModerator) {
      this.props.setAsMod(this.props.userId, this.props.roomId);
    }

    if (this.props.type === MemberManagementAction.RemoveModerator) {
      this.props.removeAsMod(this.props.userId, this.props.roomId);
    }
  };

  render() {
    if (this.props.stage === MemberManagementDialogStage.CLOSED) {
      return null;
    }

    const confirmationDefinition = getMemberManagementHandler(this.props.type, this.props.userName, this.roomLabel);
    return (
      <MemberManagementDialog
        inProgress={this.props.stage === MemberManagementDialogStage.IN_PROGRESS}
        error={this.props.error}
        onClose={this.props.cancel}
        onConfirm={this.onConfirm}
        definition={confirmationDefinition}
      />
    );
  }
}
export const MemberManagementDialogContainer = connectContainer<PublicProperties>(Container);

export class RemoveMember implements ConfirmationDefinition {
  constructor(private userName, private roomLabel) {}

  getProgressMessage = () => `Removing ${this.userName} from ${this.roomLabel}.`;
  getTitle = () => 'Remove Member';
  getMessage() {
    return (
      <>
        Are you sure you want to remove {this.userName} from {this.roomLabel}?<br />
        {this.userName} will lose access to the conversation and its history.
      </>
    );
  }
}

class MakeModerator implements ConfirmationDefinition {
  constructor(private userName, private roomLabel) {}

  getProgressMessage = () => `Making ${this.userName} moderator of ${this.roomLabel}.`;
  getTitle = () => 'Make Mod';
  getMessage() {
    return (
      <>
        Are you sure you want to make <b>{this.userName}</b> moderator of <i>{this.roomLabel}</i>?
      </>
    );
  }
}

class RemoveModerator implements ConfirmationDefinition {
  constructor(private userName, private roomLabel) {}

  getProgressMessage = () => `Removing ${this.userName} as moderator of ${this.roomLabel}.`;
  getTitle = () => 'Remove Mod';
  getMessage() {
    return (
      <>
        Are you sure you want to remove <b>{this.userName}</b> as moderator of <i>{this.roomLabel}</i>?
      </>
    );
  }
}

class Default implements ConfirmationDefinition {
  constructor(private userName, private roomLabel) {}

  getProgressMessage = () => 'In Progress';
  getTitle = () => 'Member Management';
  getMessage = () => <>Are you sure you want to perform this action?</>;
}

function getMemberManagementHandler(type: MemberManagementAction, userName: string, roomLabel: string) {
  let handlerClass;
  switch (type) {
    case MemberManagementAction.RemoveMember:
      handlerClass = RemoveMember;
      break;
    case MemberManagementAction.MakeModerator:
      handlerClass = MakeModerator;
      break;
    case MemberManagementAction.RemoveModerator:
      handlerClass = RemoveModerator;
      break;
    default:
      handlerClass = Default;
  }

  return new handlerClass(userName, roomLabel);
}
