import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { Channel, denormalize, onMuteRoom, onUnmuteRoom } from '../../../store/channels';
import { currentUserSelector } from '../../../store/authentication/selectors';
import {
  startAddGroupMember,
  LeaveGroupDialogStatus,
  setLeaveGroupStatus,
  startEditConversation,
  viewGroupInformation,
  toggleSecondarySidekick,
} from '../../../store/group-management';
import { ConversationActions } from '.';
import { openReportUserModal } from '../../../store/report-user';
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
  canReportUser: boolean;

  startAddGroupMember: () => void;
  startEditConversation: () => void;
  leaveGroupDialogStatus: LeaveGroupDialogStatus;
  setLeaveGroupStatus: (status: LeaveGroupDialogStatus) => void;
  viewGroupInformation: () => void;
  toggleSecondarySidekick: () => void;
  onMuteRoom: (payload: { roomId: string }) => void;
  onUnmuteRoom: (payload: { roomId: string }) => void;
  openReportUserModal: (payload: { reportedUserId: string }) => void;
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

    const canLeaveRoom = !isSocialChannel && !isCurrentUserRoomAdmin && hasMultipleMembers;
    const canEdit =
      !isSocialChannel && (isCurrentUserRoomAdmin || isCurrentUserRoomModerator) && !directMessage?.isOneOnOne;
    const canAddMembers = !isSocialChannel && isCurrentUserRoomAdmin && !directMessage?.isOneOnOne;
    const canViewDetails = !directMessage?.isOneOnOne || isSocialChannel;
    const canReportUser = directMessage?.isOneOnOne && !isSocialChannel;

    return {
      activeConversationId,
      directMessage,
      leaveGroupDialogStatus: groupManagement.leaveGroupDialogStatus,
      isJoiningConversation,
      canLeaveRoom,
      canEdit,
      canAddMembers,
      canViewDetails,
      canReportUser,
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
      onMuteRoom,
      onUnmuteRoom,
      openReportUserModal,
    };
  }

  openLeaveGroupDialog = () => {
    this.props.setLeaveGroupStatus(LeaveGroupDialogStatus.OPEN);
  };

  openReportUserDialog = () => {
    this.props.openReportUserModal({ reportedUserId: this.props.directMessage.otherMembers[0].userId });
  };

  muteRoom = () => {
    this.props.onMuteRoom({ roomId: this.props.activeConversationId });
  };

  unmuteRoom = () => {
    this.props.onUnmuteRoom({ roomId: this.props.activeConversationId });
  };

  get isMuted() {
    return this.props.directMessage.isMuted;
  }

  render() {
    if (
      ((!this.props.activeConversationId || !this.props.directMessage) && !this.props.isJoiningConversation) ||
      !this.props.directMessage
    ) {
      return null;
    }

    return (
      <ConversationActions
        className={this.props.className}
        canAddMembers={this.props.canAddMembers}
        canLeaveRoom={this.props.canLeaveRoom}
        canEdit={this.props.canEdit}
        canViewDetails={this.props.canViewDetails}
        canReportUser={this.props.canReportUser}
        onReportUser={this.openReportUserDialog}
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

export const ConversationActionsContainer = connectContainer<PublicProperties>(Container);
