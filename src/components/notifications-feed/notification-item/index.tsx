import { Channel } from '../../../store/channels';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import styles from './styles.module.scss';
import { MatrixAvatar } from '../../matrix-avatar';
import { isOneOnOne } from '../../../store/channels-list/utils';

export interface NotificationProps {
  conversation: Channel;
  onClick: (roomId: string) => void;
  type: 'total' | 'highlight';
}

export const NotificationItem = ({ conversation, onClick, type }: NotificationProps) => {
  const conversationIsOneOnOne = isOneOnOne(conversation);
  const getName = () => {
    return conversation.name || otherMembersToString(conversation.otherMembers);
  };

  const getAvatarUrl = () => {
    if (conversation.icon) {
      return conversation.icon;
    }
    if (conversationIsOneOnOne && conversation.otherMembers[0]?.profileImage) {
      return conversation.otherMembers[0].profileImage;
    }
    return undefined;
  };

  const count = type === 'total' ? conversation.unreadCount.total : conversation.unreadCount.highlight;
  const text = type === 'total' ? 'message' : 'highlight';
  const notificationText = count === 1 ? text : `${text}s`;

  const isSocialChannel = conversation.isSocialChannel;
  const channelType = isSocialChannel ? 'feed channel' : 'channel';

  const message = conversationIsOneOnOne
    ? `${count} unread ${notificationText} in your conversation with ${getName()}`
    : `${count} unread ${notificationText} in the ${getName()} ${channelType}`;

  return (
    <div className={styles.NotificationItem} onClick={() => onClick(conversation.id)}>
      <MatrixAvatar size='regular' imageURL={getAvatarUrl()} isGroup={!conversationIsOneOnOne} />
      <div className={styles.Content}>
        <div className={styles.Message}>{message}</div>
      </div>
      <div className={type === 'highlight' ? styles.UnreadDotHighlight : styles.UnreadDot} />
    </div>
  );
};
