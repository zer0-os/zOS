import * as React from 'react';

import { User } from '../../../../store/channels';
import { otherMembersToString } from '../../../../platform-apps/channels/util';
import Tooltip from '../../../tooltip';
import { GroupManagementMenu } from '../../../group-management-menu';
import { lastSeenText } from '../../list/utils/utils';
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
  onAddMember: () => void;
  onEdit: () => void;
  onLeaveRoom: () => void;
  onViewDetails: () => void;
  toggleSecondarySidekick: () => void;
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

  avatarStatus() {
    if (!this.props.otherMembers) {
      return 'offline';
    }

    return this.anyOthersOnline() ? 'active' : 'offline';
  }

  anyOthersOnline() {
    return this.props.otherMembers.some((m) => m.isOnline);
  }

  renderAvatar() {
    return (
      <Avatar
        size={'medium'}
        imageURL={this.avatarUrl()}
        statusType={this.avatarStatus()}
        tabIndex={-1}
        isRaised
        isGroup={!this.isOneOnOne()}
      />
    );
  }

  renderSubTitle() {
    if (!this.props.otherMembers || this.props.otherMembers.length === 0) {
      return '';
    }

    const member = this.props.otherMembers[0];

    if (this.isOneOnOne() && member) {
      const lastSeen = lastSeenText(member);
      const hasDivider = lastSeen && member.displaySubHandle ? ' | ' : '';
      return `${member.displaySubHandle || ''}${hasDivider}${lastSeen}`.trim();
    } else {
      return this.anyOthersOnline() ? 'Online' : 'Offline';
    }
  }

  renderTitle() {
    const { otherMembers, name } = this.props;

    if (!name && !otherMembers) return '';

    const otherMembersString = otherMembersToString(otherMembers);

    return (
      <Tooltip
        placement='left'
        overlay={otherMembersString}
        align={{
          offset: [
            -10,
            0,
          ],
        }}
        {...cn('user-tooltip')}
      >
        <div>{name || otherMembersString}</div>
      </Tooltip>
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
            onStartAddMember={this.addMember}
            onLeave={this.leaveGroup}
            onEdit={this.editGroup}
            onViewGroupInformation={this.viewGroupInformation}
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
