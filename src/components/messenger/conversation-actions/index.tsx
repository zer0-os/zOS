import * as React from 'react';

import { GroupManagementMenu } from '../../group-management-menu';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconChevronRight } from '@zero-tech/zui/icons';

import classNames from 'classnames';
import { bemClassName } from '../../../lib/bem';

import './styles.scss';

const cn = bemClassName('conversation-actions');

export interface Properties {
  className?: string;
  canAddMembers: boolean;
  canLeaveRoom: boolean;
  canEdit: boolean;
  canViewDetails: boolean;
  isSecondarySidekickOpen: boolean;
  isRoomMuted: boolean;
  onAddMember: () => void;
  onEdit: () => void;
  onLeaveRoom: () => void;
  onViewDetails: () => void;
  toggleSecondarySidekick: () => void;
  onMuteRoom: () => void;
  onUnmuteRoom: () => void;
}

export class ConversationActions extends React.Component<Properties> {
  editGroup = () => {
    this.props.onEdit();
  };

  addMember = () => {
    this.props.onAddMember();
  };

  leaveGroup = () => {
    this.props.onLeaveRoom();
  };

  viewGroupInformation = () => {
    this.props.onViewDetails();
  };

  toggleSidekick = () => {
    this.props.toggleSecondarySidekick();
  };

  muteRoom = () => {
    this.props.onMuteRoom();
  };

  unmuteRoom = () => {
    this.props.onUnmuteRoom();
  };

  render() {
    return (
      <div className={classNames('conversation-actions', this.props.className)}>
        <GroupManagementMenu
          canAddMembers={this.props.canAddMembers}
          canEdit={this.props.canEdit}
          canLeaveRoom={this.props.canLeaveRoom}
          canViewGroupInformation={this.props.canViewDetails}
          isRoomMuted={this.props.isRoomMuted}
          onEdit={this.editGroup}
          onLeave={this.leaveGroup}
          onMute={this.muteRoom}
          onStartAddMember={this.addMember}
          onUnmute={this.unmuteRoom}
          onViewGroupInformation={this.viewGroupInformation}
        />
        <IconButton
          {...cn('group-button', this.props.isSecondarySidekickOpen && 'is-active')}
          Icon={IconChevronRight}
          size={32}
          onClick={this.toggleSidekick}
          isFilled
        />
      </div>
    );
  }
}
