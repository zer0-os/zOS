import React from 'react';
import classNames from 'classnames';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { Channel, onRemoveReply } from '../../../store/channels';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
import { send as sendMessage } from '../../../store/messages';
import { SendPayload as PayloadSendMessage } from '../../../store/messages/saga';
import { LeaveGroupDialogStatus, setLeaveGroupStatus } from '../../../store/group-management';
import { LeaveGroupDialogContainer } from '../../group-management/leave-group-dialog/container';
import { MessageInput } from '../../message-input/container';
import { searchMentionableUsersForChannel } from '../../../platform-apps/channels/util/api';
import { Media } from '../../message-input/utils';
import { ConversationHeaderContainer as ConversationHeader } from '../conversation-header/container';

import './styles.scss';
import { getOtherMembersTypingDisplayJSX } from '../lib/utils';
import { Panel, PanelBody } from '../../layout/panel';
import { channelSelector } from '../../../store/channels/selectors';
import { isOneOnOne } from '../../../store/channels-list/utils';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  activeConversationId: string;
  directMessage: Channel;
  isJoiningConversation: boolean;
  otherMembersTypingInRoom: string[];
  leaveGroupDialogStatus: LeaveGroupDialogStatus;
  setLeaveGroupStatus: (status: LeaveGroupDialogStatus) => void;
  sendMessage: (payload: PayloadSendMessage) => void;
  onRemoveReply: () => void;
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

    const directMessage = channelSelector(activeConversationId)(state);

    return {
      activeConversationId,
      directMessage,
      isJoiningConversation,
      leaveGroupDialogStatus: groupManagement.leaveGroupDialogStatus,
      otherMembersTypingInRoom: directMessage?.otherMembersTyping || [],
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      setLeaveGroupStatus,
      onRemoveReply,
      sendMessage,
    };
  }

  isOneOnOne() {
    return isOneOnOne(this.props.directMessage);
  }

  get isLeaveGroupDialogOpen() {
    return this.props.leaveGroupDialogStatus !== LeaveGroupDialogStatus.CLOSED;
  }

  closeLeaveGroupDialog = () => {
    this.props.setLeaveGroupStatus(LeaveGroupDialogStatus.CLOSED);
  };

  renderLeaveGroupDialog = (): JSX.Element => {
    return (
      <LeaveGroupDialogContainer
        groupName={this.props.directMessage.name}
        onClose={this.closeLeaveGroupDialog}
        roomId={this.props.activeConversationId}
      />
    );
  };

  isNotEmpty = (message: string): boolean => {
    return !!message && message.trim() !== '';
  };

  searchMentionableUsers = async (search: string) => {
    return await searchMentionableUsersForChannel(search, this.props.directMessage.otherMembers);
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

  renderTypingIndicators = () => {
    const { otherMembersTypingInRoom } = this.props;
    const text = getOtherMembersTypingDisplayJSX(otherMembersTypingInRoom);
    return <div className='direct-message-chat__typing-indicator'>{text}</div>;
  };

  render() {
    if ((!this.props.activeConversationId || !this.props.directMessage) && !this.props.isJoiningConversation) {
      return null;
    }

    return (
      <Panel className={classNames('direct-message-chat', 'direct-message-chat--full-screen')}>
        {!this.props.isJoiningConversation && <ConversationHeader />}

        <PanelBody className='direct-message-chat__panel'>
          <div className='direct-message-chat__content'>
            {!this.props.isJoiningConversation && (
              <>
                <ChatViewContainer
                  key={this.props.directMessage.optimisticId || this.props.directMessage.id} // Render new component for a new chat
                  channelId={this.props.activeConversationId}
                  className='direct-message-chat__channel'
                  showSenderAvatar={!this.isOneOnOne()}
                  ref={this.chatViewContainerRef}
                />
              </>
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
                {this.renderTypingIndicators()}
              </div>
            </div>

            {this.isLeaveGroupDialogOpen && this.renderLeaveGroupDialog()}
          </div>
        </PanelBody>
      </Panel>
    );
  }
}

export const MessengerChat = connectContainer<PublicProperties>(Container);
