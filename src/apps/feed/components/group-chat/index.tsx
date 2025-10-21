import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';

import { ChatViewContainer } from '../../../../components/chat-view-container/chat-view-container';
import { MessageInput } from '../../../../components/message-input';
import { send as sendMessage } from '../../../../store/messages';
import { onRemoveReply } from '../../../../store/channels';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';

import { channelSelector } from '../../../../store/channels/selectors';
import { activeConversationIdSelector, isJoiningConversationSelector } from '../../../../store/chat/selectors';
import { validateFeedChat } from '../../../../store/chat';
import { getOtherMembersTypingDisplayJSX } from '../../../../components/messenger/lib/utils';
import { searchMentionableUsersForChannel } from '../../../../platform-apps/channels/util/api';
import { Media } from '../../../../components/message-input/utils';
import { Panel, PanelHeader, PanelBody, PanelTitle } from '../../../../components/layout/panel';
import { ConversationActionsContainer } from '../../../../components/messenger/conversation-actions/container';

import styles from '../feed-chat/styles.module.scss';

export const GroupChatContainer: React.FC<{ roomId: string }> = ({ roomId }) => {
  const dispatch = useDispatch();

  const activeConversationId = useSelector(activeConversationIdSelector);
  const isJoiningConversation = useSelector(isJoiningConversationSelector);
  const channel = useSelector(channelSelector(activeConversationId));

  const chatViewContainerRef = useRef<any>(null);

  useEffect(() => {
    if (roomId) {
      dispatch(validateFeedChat({ id: roomId }));
    }
  }, [dispatch, roomId]);

  const isNotEmpty = (message: string): boolean => {
    return !!message && message.trim() !== '';
  };

  const handleSendMessage = (message: string, mentionedUserIds: string[] = [], media: Media[] = []) => {
    // Guard: ensure we have a valid conversation context
    if (!activeConversationId) {
      return;
    }

    // Guard: do not send completely empty messages without attachments
    if (!isNotEmpty(message) && media.length === 0) {
      return;
    }

    const payload = {
      channelId: activeConversationId,
      message,
      mentionedUserIds,
      parentMessage: channel?.reply,
      files: media,
      isSocialChannel: false,
    };
    dispatch(sendMessage(payload));

    // Clear reply state if we actually sent something
    if (isNotEmpty(message) || media.length > 0) {
      dispatch(onRemoveReply());
    }

    if (chatViewContainerRef?.current) {
      chatViewContainerRef.current.scrollToBottom();
    }
  };

  const typingIndicators = () => {
    const otherMembersTypingInRoom = channel?.otherMembersTyping || [];
    const text = getOtherMembersTypingDisplayJSX(otherMembersTypingInRoom);
    return <div className='direct-message-chat__typing-indicator'>{text}</div>;
  };

  const searchMentionableUsers = async (search: string) => {
    return await searchMentionableUsersForChannel(search, channel?.otherMembers);
  };

  const shouldRender = !!(channel && activeConversationId);
  if (!shouldRender) return null;

  const isLoading = isJoiningConversation;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.Loading}>
          <Spinner />
        </div>
      );
    }

    return (
      <div className={styles.FeedChat}>
        <div className={classNames('direct-message-chat', 'direct-message-chat--full-screen')}>
          <div className='direct-message-chat__content'>
            <ChatViewContainer
              key={channel.optimisticId || channel.id}
              channelId={activeConversationId}
              ref={chatViewContainerRef}
              className='direct-message-chat__channel'
            />

            <div className='direct-message-chat__footer-position'>
              <div className='direct-message-chat__footer'>
                <div className={styles.FeedChatMessageInput}>
                  <MessageInput
                    id={activeConversationId}
                    onSubmit={handleSendMessage}
                    getUsersForMentions={searchMentionableUsers}
                    reply={channel?.reply}
                    onRemoveReply={() => dispatch(onRemoveReply())}
                  />
                  {typingIndicators()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Panel className={styles.Container}>
      <PanelHeader className={styles.PanelHeader}>
        <PanelTitle className={styles.PanelTitle}>{channel.name || 'Untitled'}</PanelTitle>
        <ConversationActionsContainer />
      </PanelHeader>
      <PanelBody className={styles.Panel}>{renderContent()}</PanelBody>
    </Panel>
  );
};
