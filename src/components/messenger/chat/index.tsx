import React from 'react';
import { IconCurrencyEthereum, IconUsers1 } from '@zero-tech/zui/icons';
import classNames from 'classnames';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import Tooltip from '../../tooltip';
import { Channel, denormalize, onRemoveReply } from '../../../store/channels';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
import { getProvider } from '../../../lib/cloudinary/provider';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { GroupManagementMenu } from '../../group-management-menu';
import { isCustomIcon } from '../list/utils/utils';
import { currentUserSelector } from '../../../store/authentication/selectors';
import { send as sendMessage } from '../../../store/messages';
import { SendPayload as PayloadSendMessage } from '../../../store/messages/saga';
import {
  startAddGroupMember,
  LeaveGroupDialogStatus,
  setLeaveGroupStatus,
  startEditConversation,
  viewGroupInformation,
} from '../../../store/group-management';
import { Modal } from '@zero-tech/zui/components';
import { LeaveGroupDialogContainer } from '../../group-management/leave-group-dialog/container';

import './styles.scss';
import { MessageInput } from '../../message-input/container';
import { searchMentionableUsersForChannel } from '../../../platform-apps/channels/util/api';
import { Media } from '../../message-input/utils';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  activeConversationId: string;
  directMessage: Channel;
  isCurrentUserRoomAdmin: boolean;
  startAddGroupMember: () => void;
  startEditConversation: () => void;
  leaveGroupDialogStatus: LeaveGroupDialogStatus;
  setLeaveGroupStatus: (status: LeaveGroupDialogStatus) => void;
  sendMessage: (payload: PayloadSendMessage) => void;
  onRemoveReply: () => void;
  viewGroupInformation: () => void;
}

export class Container extends React.Component<Properties> {
  chatViewContainerRef = null;

  constructor(props: Properties) {
    super(props);
    this.chatViewContainerRef = React.createRef();
  }

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
      startAddGroupMember,
      startEditConversation,
      setLeaveGroupStatus,
      onRemoveReply,
      sendMessage,
      viewGroupInformation,
    };
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

  renderSubTitle() {
    if (!this.props.directMessage?.otherMembers) {
      return '';
    } else if (this.isOneOnOne() && this.props.directMessage.otherMembers[0]) {
      return this.props.directMessage.otherMembers[0].primaryZID;
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

  onViewGroupInformation = () => {
    this.props.viewGroupInformation();
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

  isNotEmpty = (message: string): boolean => {
    return !!message && message.trim() !== '';
  };

  searchMentionableUsers = async (search: string) => {
    return await searchMentionableUsersForChannel(
      this.props.activeConversationId,
      search,
      this.props.directMessage.otherMembers
    );
  };

  handleSendMessage = (message: string, mentionedUserIds: string[] = [], media: Media[] = []): void => {
    const { activeConversationId } = this.props;

    let payloadSendMessage = {
      channelId: activeConversationId,
      message,
      mentionedUserIds,
      parentMessage: this.props.directMessage.reply,
      files: media,
    };

    this.props.sendMessage(payloadSendMessage);

    if (this.isNotEmpty(message)) {
      this.props.onRemoveReply();
    }

    if (this.chatViewContainerRef?.current) {
      this.chatViewContainerRef.current.scrollToBottom();
    }
  };

  renderIcon = () => {
    return this.isOneOnOne() ? (
      <IconCurrencyEthereum size={16} className={this.isOneOnOne && 'direct-message-chat__header-avatar--isOneOnOne'} />
    ) : (
      <IconUsers1 size={16} />
    );
  };

  render() {
    if (!this.props.activeConversationId || !this.props.directMessage) {
      return null;
    }

    return (
      <div className={classNames('direct-message-chat', 'direct-message-chat--full-screen')}>
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
                  onLeave={this.openLeaveGroupDialog}
                  canLeaveRoom={
                    !this.props.isCurrentUserRoomAdmin && this.props.directMessage?.otherMembers?.length > 1
                  }
                  canEdit={this.props.isCurrentUserRoomAdmin && !this.isOneOnOne()}
                  onEdit={this.props.startEditConversation}
                  onViewGroupInformation={this.onViewGroupInformation}
                  canViewGroupInformation={!this.isOneOnOne()}
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
            ref={this.chatViewContainerRef}
          />

          <div className='direct-message-chat__footer-position'>
            <div className='direct-message-chat__footer'>
              <MessageInput
                id={this.props.activeConversationId}
                onSubmit={this.handleSendMessage}
                getUsersForMentions={this.searchMentionableUsers}
                reply={this.props.directMessage.reply}
                onRemoveReply={this.props.onRemoveReply}
              />
            </div>
          </div>
          <div className='direct-message-chat__footer-gradient'></div>

          {this.isLeaveGroupDialogOpen && this.renderLeaveGroupDialog()}
        </div>
      </div>
    );
  }
}

export const MessengerChat = connectContainer<PublicProperties>(Container);
