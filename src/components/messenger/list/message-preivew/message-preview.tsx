import { getMessagePreview } from '../../../../lib/chat/chat-message';
import { useMemo, useState } from 'react';
import { getOtherMembersTypingDisplayText } from '../../lib/utils';
import { Message } from '../../../../store/messages';
import { bemClassName } from '../../../../lib/bem';
import { ContentHighlighter } from '../../../content-highlighter';
import { GetUser } from '../';

const randomLoadingMessageText = () => {
  const texts = [
    'Loadingmessagepreview...',
    'Fetchinglatestmessage...',
    'Justamoment...',
    'Retrievingconversationdetails...',
    'Connectingtochat...',
  ];
  return texts[Math.floor(Math.random() * texts.length)];
};

const cn = bemClassName('conversation-item');

interface MessagePreviewProps {
  lastMessage: Message | null;
  isOneOnOne: boolean;
  otherMembersTyping: string[];
  isUnread: boolean;
  isTyping: boolean;
  currentUserId: string;
  getUser: GetUser;
}

export const MessagePreview = ({
  lastMessage,
  isOneOnOne,
  otherMembersTyping,
  isUnread,
  isTyping,
  currentUserId,
  getUser,
}: MessagePreviewProps) => {
  const [loadingMessageText] = useState(randomLoadingMessageText());

  const messagePreview = useMemo(() => {
    if ((otherMembersTyping || []).length === 0) {
      return getMessagePreview(lastMessage, currentUserId, getUser, isOneOnOne);
    } else {
      return getOtherMembersTypingDisplayText(otherMembersTyping);
    }
  }, [
    otherMembersTyping,
    lastMessage,
    currentUserId,
    getUser,
    isOneOnOne,
  ]);

  return (
    <div
      {...cn('message', !messagePreview && 'loading')}
      is-unread={isUnread.toString()}
      is-typing={isTyping.toString()}
    >
      <ContentHighlighter message={messagePreview || loadingMessageText} variant='negative' tabIndex={-1} />
    </div>
  );
};
