import React from 'react';
import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { Channel, DefaultRoomLabels, denormalize, onAddLabel, onRemoveLabel } from '../../../../store/channels';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import {
  startAddGroupMember,
  LeaveGroupDialogStatus,
  setLeaveGroupStatus,
  startEditConversation,
  viewGroupInformation,
  toggleSecondarySidekick,
} from '../../../../store/group-management';
import { ConversationHeader as ConversationHeaderComponent } from './../conversation-header';

import './styles.scss';

export interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  activeConversationId: string;
  directMessage: Channel;
  isJoiningConversation: boolean;
  canLeaveRoom: boolean;
  canEdit: boolean;
  canAddMembers: boolean;
  canViewDetails: boolean;
  isSecondarySidekickOpen: boolean;
  startAddGroupMember: () => void;
  startEditConversation: () => void;
  leaveGroupDialogStatus: LeaveGroupDialogStatus;
  setLeaveGroupStatus: (status: LeaveGroupDialogStatus) => void;
  viewGroupInformation: () => void;
  toggleSecondarySidekick: () => void;
  onAddLabel: (payload: { roomId: string; label: string }) => void;
  onRemoveLabel: (payload: { roomId: string; label: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId, isJoiningConversation },
      groupManagement,
    } = state;

    const directMessage = denormalize(activeConversationId, state);
    const currentUser = currentUserSelector(state);
    const hasMultipleMembers = (directMessage?.otherMembers || []).length > 1;
    const isSocialChannel = directMessage?.isSocialChannel;
    const isCurrentUserRoomAdmin = directMessage?.adminMatrixIds?.includes(currentUser?.matrixId) ?? false;
    const isCurrentUserRoomModerator = directMessage?.moderatorIds?.includes(currentUser?.id) ?? false;

    const canLeaveRoom = !isCurrentUserRoomAdmin && hasMultipleMembers;
    const canEdit =
      (isCurrentUserRoomAdmin || isCurrentUserRoomModerator) && (!directMessage?.isOneOnOne || isSocialChannel);
    const canAddMembers = isCurrentUserRoomAdmin && (!directMessage?.isOneOnOne || isSocialChannel);
    const canViewDetails = !directMessage?.isOneOnOne || isSocialChannel;

    return {
      activeConversationId,
      directMessage,
      leaveGroupDialogStatus: groupManagement.leaveGroupDialogStatus,
      isJoiningConversation,
      canLeaveRoom,
      canEdit,
      canAddMembers,
      canViewDetails,
      isSecondarySidekickOpen: groupManagement.isSecondarySidekickOpen,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      startAddGroupMember,
      startEditConversation,
      setLeaveGroupStatus,
      viewGroupInformation,
      toggleSecondarySidekick,
      onAddLabel,
      onRemoveLabel,
    };
  }

  isOneOnOne() {
    return this.props.directMessage?.isOneOnOne;
  }

  openLeaveGroupDialog = () => {
    this.props.setLeaveGroupStatus(LeaveGroupDialogStatus.OPEN);
  };

  muteRoom = () => {
    this.props.onAddLabel({ roomId: this.props.activeConversationId, label: DefaultRoomLabels.MUTE });
  };

  unmuteRoom = () => {
    this.props.onRemoveLabel({ roomId: this.props.activeConversationId, label: DefaultRoomLabels.MUTE });
  };

  get isMuted() {
    return this.props.directMessage.labels?.includes(DefaultRoomLabels.MUTE);
  }

  render() {
    if (
      ((!this.props.activeConversationId || !this.props.directMessage) && !this.props.isJoiningConversation) ||
      !this.props.directMessage
    ) {
      return null;
    }

    return (
      <ConversationHeaderComponent
        className={this.props.className}
        icon={this.props.directMessage.icon}
        name={this.props.directMessage.name}
        isOneOnOne={this.isOneOnOne()}
        otherMembers={this.props.directMessage.otherMembers || []}
        canAddMembers={this.props.canAddMembers}
        canLeaveRoom={this.props.canLeaveRoom}
        canEdit={this.props.canEdit}
        canViewDetails={this.props.canViewDetails}
        onLeaveRoom={this.openLeaveGroupDialog}
        onViewDetails={this.props.viewGroupInformation}
        onAddMember={this.props.startAddGroupMember}
        onEdit={this.props.startEditConversation}
        toggleSecondarySidekick={this.props.toggleSecondarySidekick}
        isSecondarySidekickOpen={this.props.isSecondarySidekickOpen}
        isRoomMuted={this.isMuted}
        onMuteRoom={this.muteRoom}
        onUnmuteRoom={this.unmuteRoom}
      />
    );
  }
}

export const ConversationHeader = connectContainer<PublicProperties>(Container);
