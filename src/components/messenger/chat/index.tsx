import { useRef, useCallback, FC, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { onRemoveReply } from '../../../store/channels';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
import { send as sendMessageAction } from '../../../store/messages';
import { SendPayload as PayloadSendMessage } from '../../../store/messages/saga';
import {
  LeaveGroupDialogStatus,
  setLeaveGroupStatus as setLeaveGroupStatusAction,
} from '../../../store/group-management';
import { LeaveGroupDialogContainer } from '../../group-management/leave-group-dialog/container';
import { MessageInput } from '../../message-input/container';
import { searchMentionableUsersForChannel } from '../../../platform-apps/channels/util/api';
import { Media } from '../../message-input/utils';
import { ConversationHeaderContainer as ConversationHeader } from '../conversation-header/container';
import { Panel, PanelBody } from '../../layout/panel';
import { ChatTypingIndicator } from './typing-indicator';

import './styles.scss';
import { leaveGroupDialogStatusSelector } from '../../../store/group-management/selectors';
import { activeConversationIdSelector, isJoiningConversationSelector } from '../../../store/chat/selectors';
import { useChannelSelector, useUsersSelector } from '../../../store/hooks';
import InvertedScroll from '../../inverted-scroll';

const isNotEmpty = (message: string): boolean => {
  return !!message && message.trim() !== '';
};

export const MessengerChat: FC = () => {
  const dispatch = useDispatch();

  const activeConversationId = useSelector(activeConversationIdSelector);
  const isJoiningConversation = useSelector(isJoiningConversationSelector);
  const leaveGroupDialogStatus = useSelector(leaveGroupDialogStatusSelector);
  const directMessage = useChannelSelector(activeConversationId);
  const channelOtherMembers = useUsersSelector(directMessage?.otherMembers || []);

  const chatViewContainerRef = useRef<InvertedScroll | null>(null);

  const setLeaveGroupStatus = useCallback(
    (status: LeaveGroupDialogStatus) => {
      dispatch(setLeaveGroupStatusAction(status));
    },
    [dispatch]
  );

  const onRemoveReplyAction = useCallback(() => {
    dispatch(onRemoveReply());
  }, [dispatch]);

  const sendMessage = useCallback(
    (payload: PayloadSendMessage) => {
      dispatch(sendMessageAction(payload));
    },
    [dispatch]
  );

  const searchMentionableUsers = useCallback(
    async (search: string) => {
      if (!directMessage?.id) {
        return [];
      }
      return searchMentionableUsersForChannel(search, channelOtherMembers || []);
    },
    [directMessage?.id, channelOtherMembers]
  );

  const reply = useMemo(() => directMessage?.reply, [directMessage?.reply]);
  const handleSendMessage = useCallback(
    (messageText: string, mentionedUserIds: string[] = [], media: Media[] = []): void => {
      if (!activeConversationId) {
        return;
      }

      const payload: PayloadSendMessage = {
        channelId: activeConversationId,
        message: messageText,
        mentionedUserIds,
        parentMessage: reply,
        files: media,
      };

      sendMessage(payload);

      if (isNotEmpty(messageText)) {
        onRemoveReplyAction();
      }

      if (chatViewContainerRef.current) {
        chatViewContainerRef.current.scrollToBottom();
      }
    },
    [
      activeConversationId,
      reply,
      sendMessage,
      onRemoveReplyAction,
      chatViewContainerRef,
    ]
  );

  if ((!activeConversationId || !directMessage) && !isJoiningConversation) {
    return null;
  }

  const isLeaveGroupDialogOpen = leaveGroupDialogStatus !== LeaveGroupDialogStatus.CLOSED;

  return (
    <Panel className={classNames('direct-message-chat', 'direct-message-chat--full-screen')}>
      {!isJoiningConversation && <ConversationHeader />}

      <PanelBody className='direct-message-chat__panel'>
        <div className='direct-message-chat__content'>
          {!isJoiningConversation && directMessage && activeConversationId && (
            <>
              <ChatViewContainer
                key={directMessage.optimisticId || directMessage.id}
                channelId={activeConversationId}
                className='direct-message-chat__channel'
                ref={chatViewContainerRef}
              />
            </>
          )}

          <div className='direct-message-chat__footer-position'>
            <div className='direct-message-chat__footer'>
              {activeConversationId && (
                <MessageInput
                  id={activeConversationId}
                  onSubmit={handleSendMessage}
                  getUsersForMentions={searchMentionableUsers}
                  reply={reply}
                  onRemoveReply={onRemoveReplyAction}
                />
              )}
              <ChatTypingIndicator
                className='direct-message-chat__typing-indicator'
                usersTyping={directMessage?.otherMembersTyping || []}
              />
            </div>
          </div>

          {isLeaveGroupDialogOpen && (
            <LeaveGroupDialogContainer
              groupName={directMessage.name}
              onClose={() => setLeaveGroupStatus(LeaveGroupDialogStatus.CLOSED)}
              roomId={activeConversationId}
            />
          )}
        </div>
      </PanelBody>
    </Panel>
  );
};
