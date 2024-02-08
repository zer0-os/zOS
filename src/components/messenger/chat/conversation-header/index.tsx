import * as React from 'react';

import { Channel } from '../../../../store/channels';
import { otherMembersToString } from '../../../../platform-apps/channels/util';
import Tooltip from '../../../tooltip';
import { isCustomIcon } from '../../list/utils/utils';
import { getProvider } from '../../../../lib/cloudinary/provider';
import { GroupManagementMenu } from '../../../group-management-menu';

import { IconCurrencyEthereum, IconUsers1 } from '@zero-tech/zui/icons';

import classNames from 'classnames';

export interface Properties {
  directMessage: Channel;
  isCurrentUserRoomAdmin: boolean;
  startAddGroupMember: () => void;
  startEditConversation: () => void;
  onLeave: () => void;
  onViewGroupInformation: () => void;
}

export class ConversationHeader extends React.Component<Properties> {
  isOneOnOne() {
    return this.props.directMessage?.isOneOnOne;
  }

  avatarUrl() {
    if (!this.props.directMessage?.otherMembers) {
      return '';
    }

    if (this.isOneOnOne() && this.props.directMessage.otherMembers[0]) {
      return this.props.directMessage.otherMembers[0].profileImage;
    }

    if (isCustomIcon(this.props.directMessage?.icon)) {
      return this.props.directMessage?.icon;
    }

    return '';
  }

  avatarStatus() {
    if (!this.props.directMessage?.otherMembers) {
      return 'unknown';
    }

    return this.anyOthersOnline() ? 'online' : 'offline';
  }

  anyOthersOnline() {
    return this.props.directMessage.otherMembers.some((m) => m.isOnline);
  }

  renderIcon = () => {
    return this.isOneOnOne() ? (
      <IconCurrencyEthereum size={16} className={this.isOneOnOne && 'direct-message-chat__header-avatar--isOneOnOne'} />
    ) : (
      <IconUsers1 size={16} />
    );
  };

  renderSubTitle() {
    if (!this.props.directMessage?.otherMembers) {
      return '';
    } else if (this.isOneOnOne() && this.props.directMessage.otherMembers[0]) {
      return this.props.directMessage.otherMembers[0].displaySubHandle;
    } else {
      return this.anyOthersOnline() ? 'Online' : 'Offline';
    }
  }

  renderTitle() {
    const { directMessage } = this.props;

    if (!directMessage) return '';

    const otherMembers = otherMembersToString(directMessage.otherMembers);

    return (
      <Tooltip
        placement='left'
        overlay={otherMembers}
        align={{
          offset: [
            -10,
            0,
          ],
        }}
        className='direct-message-chat__user-tooltip'
        key={directMessage.id}
      >
        <div>{directMessage.name || otherMembers}</div>
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
            canAddMembers={this.props.isCurrentUserRoomAdmin && !this.isOneOnOne()}
            onStartAddMember={this.props.startAddGroupMember}
            onLeave={this.props.onLeave}
            canLeaveRoom={!this.props.isCurrentUserRoomAdmin && this.props.directMessage?.otherMembers?.length > 1}
            canEdit={this.props.isCurrentUserRoomAdmin && !this.isOneOnOne()}
            onEdit={this.props.startEditConversation}
            onViewGroupInformation={this.props.onViewGroupInformation}
            canViewGroupInformation={!this.isOneOnOne()}
          />
        </div>
      </div>
    );
  }
}
