import * as React from 'react';

import { User } from '../../../../store/channels';
import { otherMembersToString } from '../../../../platform-apps/channels/util';
import Tooltip from '../../../tooltip';
import { isCustomIcon } from '../../list/utils/utils';
import { getProvider } from '../../../../lib/cloudinary/provider';
import { GroupManagementMenu } from '../../../group-management-menu';

import { IconCurrencyEthereum, IconUsers1 } from '@zero-tech/zui/icons';

import classNames from 'classnames';

export interface Properties {
  isOneOnOne: boolean;
  otherMembers: User[];
  icon: string;
  name: string;
  canAddMembers: boolean;
  canLeaveRoom: boolean;
  canEdit: boolean;
  canViewGroupInformation: boolean;
  startAddGroupMember: () => void;
  startEditConversation: () => void;
  onLeave: () => void;
  onViewGroupInformation: () => void;
}

export class ConversationHeader extends React.Component<Properties> {
  isOneOnOne() {
    return this.props.isOneOnOne;
  }

  avatarUrl() {
    if (!this.props.otherMembers) {
      return '';
    }

    if (this.isOneOnOne() && this.props.otherMembers[0]) {
      return this.props.otherMembers[0].profileImage;
    }

    if (isCustomIcon(this.props.icon)) {
      return this.props.icon;
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
      <IconCurrencyEthereum size={16} className={this.isOneOnOne && 'direct-message-chat__header-avatar--isOneOnOne'} />
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
        className='direct-message-chat__user-tooltip'
      >
        <div>{name || otherMembersString}</div>
      </Tooltip>
    );
  }

  render() {
    return (
      <div className='direct-message-chat__header'>
        <span>
          <div
            style={{
              backgroundImage: `url(${getProvider().getSourceUrl(this.avatarUrl())})`,
            }}
            className={classNames(
              'direct-message-chat__header-avatar',
              `direct-message-chat__header-avatar--${this.avatarStatus()}`
            )}
          >
            {!this.avatarUrl() && this.renderIcon()}
          </div>
        </span>

        <span className='direct-message-chat__description'>
          <div className='direct-message-chat__title'>{this.renderTitle()}</div>
          <div className='direct-message-chat__subtitle'>{this.renderSubTitle()}</div>
        </span>

        <div className='direct-message-chat__group-management-menu-container'>
          <GroupManagementMenu
            canAddMembers={this.props.canAddMembers}
            canLeaveRoom={this.props.canLeaveRoom}
            canEdit={this.props.canEdit}
            canViewGroupInformation={this.props.canViewGroupInformation}
            onStartAddMember={this.props.startAddGroupMember}
            onLeave={this.props.onLeave}
            onEdit={this.props.startEditConversation}
            onViewGroupInformation={this.props.onViewGroupInformation}
          />
        </div>
      </div>
    );
  }
}
