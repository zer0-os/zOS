import React from 'react';
import classNames from 'classnames';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { Channel, denormalize, onRemoveReply } from '../../../store/channels';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
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
import { JoiningConversationDialog } from '../../joining-conversation-dialog';
import { MessageInput } from '../../message-input/container';
import { searchMentionableUsersForChannel } from '../../../platform-apps/channels/util/api';
import { Media } from '../../message-input/utils';
import { ConversationHeader } from './conversation-header';

import './styles.scss';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  activeConversationId: string;
  directMessage: Channel;
  isCurrentUserRoomAdmin: boolean;
  isJoiningConversation: boolean;
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
      chat: { activeConversationId, isJoiningConversation },
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
      isJoiningConversation,
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

  isOneOnOne() {
    return this.props.directMessage?.isOneOnOne;
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

  render() {
    if ((!this.props.activeConversationId || !this.props.directMessage) && !this.props.isJoiningConversation) {
      return null;
    }

    return (
      <div className={classNames('direct-message-chat', 'direct-message-chat--full-screen')}>
        <div className='direct-message-chat__content'>
          <div className='direct-message-chat__header-gradient'></div>
          <div className='direct-message-chat__header-position'>
            <ConversationHeader
              directMessage={this.props.directMessage}
              onLeave={this.openLeaveGroupDialog}
              onViewGroupInformation={this.onViewGroupInformation}
              isCurrentUserRoomAdmin={this.props.isCurrentUserRoomAdmin}
              startAddGroupMember={this.props.startAddGroupMember}
              startEditConversation={this.props.startEditConversation}
            />
          </div>

          {!this.props.isJoiningConversation && (
            <ChatViewContainer
              key={this.props.directMessage.optimisticId || this.props.directMessage.id} // Render new component for a new chat
              channelId={this.props.activeConversationId}
              className='direct-message-chat__channel'
              isDirectMessage
              showSenderAvatar={!this.isOneOnOne()}
              ref={this.chatViewContainerRef}
            />
          )}

          <div className='direct-message-chat__footer-position'>
            <div className='direct-message-chat__footer'>
              <MessageInput
                id={this.props.activeConversationId}
                onSubmit={this.handleSendMessage}
                getUsersForMentions={this.searchMentionableUsers}
                reply={this.props.directMessage?.reply}
                onRemoveReply={this.props.onRemoveReply}
              />
            </div>
          </div>
          <div className='direct-message-chat__footer-gradient'></div>

          {this.isLeaveGroupDialogOpen && this.renderLeaveGroupDialog()}
          {this.props.isJoiningConversation && <JoiningConversationDialog />}
        </div>
      </div>
    );
  }
}

export const MessengerChat = connectContainer<PublicProperties>(Container);
