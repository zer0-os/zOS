import React from 'react';
import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { ChatViewContainer } from '../../../../components/chat-view-container/chat-view-container';
import { validateFeedChat } from '../../../../store/chat';
import { Channel, onRemoveReply } from '../../../../store/channels';
import { MessageInput } from '../../../../components/message-input';
import { send as sendMessage } from '../../../../store/messages';
import { SendPayload as PayloadSendMessage } from '../../../../store/messages/saga';
import { searchMentionableUsersForChannel } from '../../../../platform-apps/channels/util/api';
import { Media } from '../../../../components/message-input/utils';
import { config } from '../../../../config';
import { ErrorDialogContent } from '../../../../store/chat/types';
import { getOtherMembersTypingDisplayJSX } from '../../../../components/messenger/lib/utils';
import { channelSelector } from '../../../../store/channels/selectors';
import { toggleSecondarySidekick } from '../../../../store/group-management';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';

import classNames from 'classnames';
import styles from './styles.module.scss';

export interface PublicProperties {
  zid?: string;
}

export interface Properties extends PublicProperties {
  channel: Channel;
  activeConversationId: string;
  isJoiningConversation: boolean;
  isConversationsLoaded: boolean;
  joinRoomErrorContent: ErrorDialogContent;
  otherMembersTypingInRoom: string[];
  validateFeedChat: (id: string) => void;
  onRemoveReply: () => void;
  sendMessage: (payload: PayloadSendMessage) => void;
  toggleSecondarySidekick: () => void;
}

export class Container extends React.Component<Properties> {
  chatViewContainerRef = null;
  hasValidated = false;

  constructor(props: Properties) {
    super(props);
    this.chatViewContainerRef = React.createRef();
  }

  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId, joinRoomErrorContent, isJoiningConversation, isConversationsLoaded },
    } = state;

    const channel = channelSelector(activeConversationId)(state);

    return {
      channel,
      activeConversationId,
      joinRoomErrorContent,
      isJoiningConversation,
      isConversationsLoaded,
      otherMembersTypingInRoom: channel?.otherMembersTyping || [],
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      sendMessage,
      onRemoveReply,
      toggleSecondarySidekick,
      validateFeedChat: (id: string) => validateFeedChat({ id }),
    };
  }

  componentDidMount(): void {
    if (this.props.zid && !this.hasValidated) {
      const roomAlias = `${this.props.zid}:${config.matrixHomeServerName}`;
      this.props.validateFeedChat(roomAlias);
      this.hasValidated = true;
    }
  }

  componentDidUpdate(prevProps: Properties): void {
    if (this.props.zid !== prevProps.zid) {
      this.hasValidated = false; // Reset flag when zid changes
      if (this.props.zid && !this.hasValidated) {
        const roomAlias = `${this.props.zid}:${config.matrixHomeServerName}`;
        this.props.validateFeedChat(roomAlias);
        this.hasValidated = true;
      }
    }
  }

  isNotEmpty = (message: string): boolean => {
    return !!message && message.trim() !== '';
  };

  searchMentionableUsers = async (search: string) => {
    return await searchMentionableUsersForChannel(search, this.props.channel.otherMembers);
  };

  handleSendMessage = (message: string, mentionedUserIds: string[] = [], media: Media[] = []): void => {
    const { activeConversationId } = this.props;

    const payloadSendMessage = {
      channelId: activeConversationId,
      message,
      mentionedUserIds,
      parentMessage: this.props.channel.reply,
      files: media,
      isSocialChannel: true,
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

  toggleSidekick = () => {
    this.props.toggleSecondarySidekick();
  };

  renderBody = (isLoading: boolean) => {
    return (
      <>
        {isLoading && (
          <div className={styles.Loading}>
            <Spinner />
          </div>
        )}
        <div className={styles.FeedChat}>
          <div className={classNames('direct-message-chat', 'direct-message-chat--full-screen')}>
            <div className='direct-message-chat__content'>
              {!isLoading && (
                <ChatViewContainer
                  key={this.props.channel.optimisticId || this.props.channel.id} // Render new component for a new chat
                  channelId={this.props.activeConversationId}
                  ref={this.chatViewContainerRef}
                  className='direct-message-chat__channel'
                />
              )}

              <div className='direct-message-chat__footer-position'>
                <div className='direct-message-chat__footer'>
                  <div className={styles.FeedChatMessageInput}>
                    {!isLoading && (
                      <MessageInput
                        id={this.props.activeConversationId}
                        onSubmit={this.handleSendMessage}
                        getUsersForMentions={this.searchMentionableUsers}
                        reply={this.props.channel?.reply}
                        onRemoveReply={this.props.onRemoveReply}
                      />
                    )}
                    {this.renderTypingIndicators()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  render() {
    const shouldRender = !!(
      this.props.zid &&
      this.props.channel &&
      this.props.activeConversationId &&
      !this.props.joinRoomErrorContent
    );

    if (!shouldRender) {
      return null;
    }

    return this.renderBody(this.props.isJoiningConversation || !this.props.isConversationsLoaded);
  }
}

export const FeedChatContainer = connectContainer<PublicProperties>(Container);
