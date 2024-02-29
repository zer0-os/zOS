import * as React from 'react';

import { User } from '../../../../store/channels';
import { otherMembersToString } from '../../../../platform-apps/channels/util';
import Tooltip from '../../../tooltip';
import { isCustomIcon } from '../../list/utils/utils';
import { getProvider } from '../../../../lib/cloudinary/provider';
import { GroupManagementMenu } from '../../../group-management-menu';

import { IconCurrencyEthereum, IconUsers1 } from '@zero-tech/zui/icons';

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

    if (isCustomIcon(this.props.icon)) {
      return this.props.icon;
    }

    if (this.isOneOnOne() && this.props.otherMembers[0]) {
      return this.props.otherMembers[0].profileImage;
    }

    return '';
  }

  avatarStatus() {
    if (!this.props.otherMembers) {
      return 'unknown';
    }

    return this.anyOthersOnline() ? 'online' : 'offline';
  }

  anyOthersOnline() {
    return this.props.otherMembers.some((m) => m.isOnline);
  }

  renderIcon = () => {
    return this.isOneOnOne() ? (
      <IconCurrencyEthereum size={16} {...cn('avatar-icon', 'isOneOnOne')} />
    ) : (
      <IconUsers1 size={16} />
    );
  };

  renderSubTitle() {
    if (!this.props.otherMembers) {
      return '';
    } else if (this.isOneOnOne() && this.props.otherMembers[0]) {
      return this.props.otherMembers[0].displaySubHandle;
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
        <span>
          <div
            style={{
              backgroundImage: `url(${getProvider().getSourceUrl(this.avatarUrl())})`,
            }}
            {...cn('avatar', this.avatarStatus())}
          >
            {!this.avatarUrl() && this.renderIcon()}
          </div>
        </span>

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
