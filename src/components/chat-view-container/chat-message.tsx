import { Message } from '../message';
import { Message as MessageModel, Media, EditMessageOptions, sendEmojiReaction } from '../../store/messages';
import { bemClassName } from '../../lib/bem';
import classNames from 'classnames';
import { getMessageRenderProps } from './utils';
import { useCallback } from 'react';
import { openDeleteMessage } from '../../store/dialogs';
import { useDispatch } from 'react-redux';
import { editMessage } from '../../store/messages/saga';
import { UserForMention } from '../message-input/utils';
import { ParentMessage } from '../../lib/chat/types';
import { onReply } from '../../store/channels';
import { openReportUserModal } from '../../store/report-user';

const componentCn = bemClassName('chat-view');

interface MessageGroupProps {
  message: MessageModel;
  channelId: string;
  renderIndex: number;
  groupLength: number;
  isUserOwner: boolean;
  isUserOwnerOfParentMessage: boolean;
  isOneOnOne: boolean;
  showSenderAvatar: boolean;
  mediaMessages: Map<string, MessageModel>;

  onImageClick: (media: Media) => void;
  onOpenMessageInfo: (messageId: string) => void;
  onHiddenMessageInfoClick: () => void;
  getUsersForMentions: (search: string) => Promise<UserForMention[]>;
}

export const ChatMessage = ({
  message,
  channelId,
  renderIndex,
  isUserOwner,
  isUserOwnerOfParentMessage,
  groupLength,
  isOneOnOne,
  showSenderAvatar,
  mediaMessages,
  onImageClick,
  onOpenMessageInfo,
  onHiddenMessageInfoClick,
  getUsersForMentions,
}: MessageGroupProps) => {
  const dispatch = useDispatch();

  const handleDeleteMessage = useCallback(
    (messageId: string): void => {
      if (messageId) {
        dispatch(openDeleteMessage(messageId));
      }
    },
    [dispatch]
  );

  const handleEditMessage = useCallback(
    (messageId: string, message: string, mentionedUserIds: string[], data?: Partial<EditMessageOptions>): void => {
      if (channelId && messageId) {
        dispatch(editMessage({ channelId, messageId, message, mentionedUserIds, data }));
      }
    },
    [channelId, dispatch]
  );

  const handleReply = useCallback(
    ({ reply }: { reply: ParentMessage }): void => {
      dispatch(onReply({ reply }));
    },
    [dispatch]
  );

  const handleReportUser = useCallback(
    ({ reportedUserId }: { reportedUserId: string }): void => {
      dispatch(openReportUserModal({ reportedUserId }));
    },
    [dispatch]
  );

  const sendEmojiReactionHandler = useCallback(
    (messageId: string, key: string) => {
      dispatch(sendEmojiReaction({ roomId: channelId, messageId, key }));
    },
    [channelId, dispatch]
  );

  const messageRenderProps = getMessageRenderProps(renderIndex, groupLength, isOneOnOne, isUserOwner);
  const mediaMessage = mediaMessages.get(message.id) || mediaMessages.get(message.optimisticId);

  return (
    <div
      key={message.optimisticId || message.id}
      className={classNames('messages__message-row', {
        'messages__message-row--owner': isUserOwner,
      })}
    >
      <div {...componentCn('group-message', messageRenderProps.position)}>
        <Message
          className={classNames('messages__message', {
            'messages__message--last-in-group': showSenderAvatar && renderIndex === groupLength - 1,
          })}
          onImageClick={onImageClick}
          messageId={message.id}
          isOwner={isUserOwner}
          onDelete={handleDeleteMessage}
          onEdit={handleEditMessage}
          onReply={handleReply}
          onReportUser={handleReportUser}
          onInfo={onOpenMessageInfo}
          parentSenderIsCurrentUser={isUserOwnerOfParentMessage}
          parentSenderFirstName={message.parentMessage?.sender?.firstName}
          parentSenderLastName={message.parentMessage?.sender?.lastName}
          getUsersForMentions={getUsersForMentions}
          showSenderAvatar={showSenderAvatar}
          showTimestamp={messageRenderProps.showTimestamp}
          showAuthorName={messageRenderProps.showAuthorName}
          onHiddenMessageInfoClick={onHiddenMessageInfoClick}
          sendEmojiReaction={sendEmojiReactionHandler}
          mediaMessage={mediaMessage}
          {...message}
        />
      </div>
    </div>
  );
};
