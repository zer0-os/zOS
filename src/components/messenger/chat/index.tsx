import React from 'react';
import { IconUsers1 } from '@zero-tech/zui/icons';
import classNames from 'classnames';
import { setactiveConversationId } from '../../../store/chat';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import Tooltip from '../../tooltip';
import { Channel, denormalize } from '../../../store/channels';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
import { getProvider } from '../../../lib/cloudinary/provider';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { GroupManagementMenu } from '../../group-management-menu';
import { isCustomIcon } from '../list/utils/utils';
import { currentUserSelector } from '../../../store/authentication/selectors';
import {
  startAddGroupMember,
  LeaveGroupDialogStatus,
  setLeaveGroupStatus,
  startEditConversation,
} from '../../../store/group-management';
import { Modal } from '@zero-tech/zui/components';
import { LeaveGroupDialogContainer } from '../../group-management/leave-group-dialog/container';

import './styles.scss';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  activeConversationId: string;
  setactiveConversationId: (activeDirectMessageId: string) => void;
  directMessage: Channel;
  isCurrentUserRoomAdmin: boolean;
  startAddGroupMember: () => void;
  startEditConversation: () => void;
  leaveGroupDialogStatus: LeaveGroupDialogStatus;
  setLeaveGroupStatus: (status: LeaveGroupDialogStatus) => void;
}

interface State {
  isMinimized: boolean;
}

export class Container extends React.Component<Properties, State> {
  state = { isMinimized: false };

  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId },
      groupManagement,
    } = state;

    const directMessage = denormalize(activeConversationId, state);
    const currentUser = currentUserSelector(state);
    const isCurrentUserRoomAdmin = directMessage?.adminMatrixIds?.includes(currentUser?.matrixId) ?? false;

    return {
      activeConversationId,
      directMessage,
      isCurrentUserRoomAdmin,
      leaveGroupDialogStatus: groupManagement.leaveGroupDialogStatus,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      setactiveConversationId,
      startAddGroupMember,
      startEditConversation,
      setLeaveGroupStatus,
    };
  }

  handleClose = (): void => {
    this.props.setactiveConversationId('');
  };

  componentDidUpdate(prevProps: Properties): void {
    if (prevProps.activeConversationId !== this.props.activeConversationId) {
      this.setState({ isMinimized: false });
    }
  }

  handleMinimizeClick = (): void => {
    this.setState((state) => ({ isMinimized: !state.isMinimized }));
  };

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

  renderSubTitle() {
    if (!this.props.directMessage?.otherMembers) {
      return '';
    } else {
      return this.anyOthersOnline() ? 'Online' : 'Offline';
    }
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

  isOneOnOne() {
    return this.props.directMessage?.isOneOnOne;
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

  get isLeaveGroupDialogOpen() {
    return this.props.leaveGroupDialogStatus !== LeaveGroupDialogStatus.CLOSED;
  }
  openLeaveGroupDialog = () => {
    this.props.setLeaveGroupStatus(LeaveGroupDialogStatus.OPEN);
  };
  closeLeaveGroupDialog = () => {
    this.props.setLeaveGroupStatus(LeaveGroupDialogStatus.CLOSED);
  };

  renderLeaveGroupDialog = (): JSX.Element => {
    return (
      <Modal open={this.isLeaveGroupDialogOpen} onOpenChange={this.closeLeaveGroupDialog}>
        <LeaveGroupDialogContainer
          groupName={this.props.directMessage.name}
          onClose={this.closeLeaveGroupDialog}
          roomId={this.props.activeConversationId}
        />
      </Modal>
    );
  };

  render() {
    if (!this.props.activeConversationId || !this.props.directMessage) {
      return null;
    }

    return (
      <div
        className={classNames('direct-message-chat', {
          'direct-message-chat--full-screen': true, // todo: remove & update styles for this
          'direct-message-chat--minimized': this.state.isMinimized,
        })}
      >
        <div className='direct-message-chat__content'>
          <div className='direct-message-chat__header-gradient'></div>
          <div className='direct-message-chat__header-position'>
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
                  {!this.isOneOnOne() && <IconUsers1 size={16} />}
                </div>
              </span>
              <span className='direct-message-chat__description'>
                <div className='direct-message-chat__title'>{this.renderTitle()}</div>
                <div className='direct-message-chat__subtitle'>{this.renderSubTitle()}</div>
              </span>
              <div className='direct-message-chat__group-management-menu-container'>
                <GroupManagementMenu
                  canAddMembers={this.props.isCurrentUserRoomAdmin}
                  onStartAddMember={this.props.startAddGroupMember}
                  onLeave={this.openLeaveGroupDialog}
                  canLeaveRoom={
                    !this.props.isCurrentUserRoomAdmin && this.props.directMessage?.otherMembers?.length > 1
                  }
                  canEdit={this.props.isCurrentUserRoomAdmin && !this.isOneOnOne()}
                  onEdit={this.props.startEditConversation}
                />
              </div>
            </div>
          </div>

          <ChatViewContainer
            key={this.props.directMessage.optimisticId || this.props.directMessage.id} // Render new component for a new chat
            channelId={this.props.activeConversationId}
            className='direct-message-chat__channel'
            isDirectMessage
            showSenderAvatar={!this.isOneOnOne()}
          />

          {this.isLeaveGroupDialogOpen && this.renderLeaveGroupDialog()}
        </div>
      </div>
    );
  }
}

export const MessengerChat = connectContainer<PublicProperties>(Container);
