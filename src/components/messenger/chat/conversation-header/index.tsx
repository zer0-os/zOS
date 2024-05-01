import * as React from 'react';

import { User } from '../../../../store/channels';
import { otherMembersToString } from '../../../../platform-apps/channels/util';
import Tooltip from '../../../tooltip';
import { GroupManagementMenu } from '../../../group-management-menu';
import { lastSeenText } from '../../list/utils/utils';
import { Avatar } from '@zero-tech/zui/components';

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
  onAddMember: () => void;
  onEdit: () => void;
  onLeaveRoom: () => void;
  onViewDetails: () => void;
}

export class ConversationHeader extends React.Component<Properties> {
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
        <div {...cn('avatar')}>{this.renderAvatar()}</div>

        <span {...cn('description')}>
          <div {...cn('title')}>{this.renderTitle()}</div>
          <div {...cn('subtitle')}>{this.renderSubTitle()}</div>
        </span>

        <div {...cn('group-management-menu-container')}>
          <GroupManagementMenu
            canAddMembers={this.props.canAddMembers}
            canLeaveRoom={this.props.canLeaveRoom}
            canEdit={this.props.canEdit}
            canViewGroupInformation={this.props.canViewDetails}
            onStartAddMember={this.props.onAddMember}
            onLeave={this.props.onLeaveRoom}
            onEdit={this.props.onEdit}
            onViewGroupInformation={this.props.onViewDetails}
          />
        </div>
      </div>
    );
  }
}
