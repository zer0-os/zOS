import * as React from 'react';

import { User } from '../../../../store/channels';
import { otherMembersToString } from '../../../../platform-apps/channels/util';
import { GroupManagementMenu } from '../../../group-management-menu';
import { Avatar, IconButton } from '@zero-tech/zui/components';
import { IconUsers1 } from '@zero-tech/zui/icons';
import { bemClassName } from '../../../../lib/bem';

import './styles.scss';

const cn = bemClassName('conversation-header');

export interface Properties {
  isOneOnOne: boolean;
  otherMembers: User[];
  icon: string;
  name: string;
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

export class ConversationHeader extends React.Component<Properties> {
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

  isOneOnOne() {
    return this.props.isOneOnOne;
  }

  avatarUrl() {
    if (!this.props.otherMembers) {
      return '';
    }

    if (this.props.icon) {
      return this.props.icon;
    }

    if (this.isOneOnOne() && this.props.otherMembers[0]) {
      return this.props.otherMembers[0].profileImage;
    }

    return '';
  }

  renderAvatar() {
    return <Avatar size={'medium'} imageURL={this.avatarUrl()} tabIndex={-1} isRaised isGroup={!this.isOneOnOne()} />;
  }

  renderSubTitle() {
    if (!this.props.otherMembers || this.props.otherMembers.length === 0) {
      return '';
    }

    const member = this.props.otherMembers[0];

    if (this.isOneOnOne() && member) {
      return `${member.displaySubHandle || ''}`;
    }
  }

  renderTitle() {
    const { otherMembers, name } = this.props;

    if (!name && !otherMembers) return '';

    const otherMembersString = otherMembersToString(otherMembers);

    return (
      <div {...cn('user-tooltip')}>
        <div>{name || otherMembersString}</div>
      </div>
    );
  }

  render() {
    return (
      <div {...cn('')}>
        <div {...cn('details-container')} onClick={this.toggleSidekick}>
          <div {...cn('avatar')}>{this.renderAvatar()}</div>

          <span {...cn('description')}>
            <div {...cn('title')}>{this.renderTitle()}</div>
            <div {...cn('subtitle')}>{this.renderSubTitle()}</div>
          </span>
        </div>

        <div {...cn('group-management-menu-container')}>
          <GroupManagementMenu
            canAddMembers={this.props.canAddMembers}
            canLeaveRoom={this.props.canLeaveRoom}
            canEdit={this.props.canEdit}
            canViewGroupInformation={this.props.canViewDetails}
            isRoomMuted={this.props.isRoomMuted}
            onStartAddMember={this.addMember}
            onLeave={this.leaveGroup}
            onEdit={this.editGroup}
            onViewGroupInformation={this.viewGroupInformation}
            onMute={this.muteRoom}
            onUnmute={this.unmuteRoom}
          />

          <IconButton
            {...cn('group-button', this.props.isSecondarySidekickOpen && 'is-active')}
            Icon={IconUsers1}
            size={32}
            onClick={this.toggleSidekick}
          />
        </div>
      </div>
    );
  }
}
