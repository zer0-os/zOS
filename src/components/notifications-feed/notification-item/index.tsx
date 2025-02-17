import { Avatar } from '@zero-tech/zui/components/Avatar';
import { Channel } from '../../../store/channels';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import styles from './styles.module.scss';

export interface NotificationProps {
  conversation: Channel;
  onClick: (roomId: string) => void;
  type: 'total' | 'highlight';
}

export const NotificationItem = ({ conversation, onClick, type }: NotificationProps) => {
  const getName = () => {
    return conversation.name || otherMembersToString(conversation.otherMembers);
  };

  const getAvatarUrl = () => {
    if (conversation.icon) {
      return conversation.icon;
    }
    if (conversation.isOneOnOne && conversation.otherMembers[0]?.profileImage) {
      return conversation.otherMembers[0].profileImage;
    }
    return undefined;
  };

  const count = type === 'total' ? conversation.unreadCount.total : conversation.unreadCount.highlight;
  const text = type === 'total' ? 'message' : 'highlight';
  const notificationText = count === 1 ? text : `${text}s`;

  const isSocialChannel = conversation.isSocialChannel;
  const channelType = isSocialChannel ? 'feed channel' : 'channel';

  const message = conversation.isOneOnOne
    ? `${count} unread ${notificationText} in your conversation with ${getName()}`
    : `${count} unread ${notificationText} in the ${getName()} ${channelType}`;

  return (
    <div className={styles.NotificationItem} onClick={() => onClick(conversation.id)}>
      <Avatar size='regular' imageURL={getAvatarUrl()} isGroup={!conversation.isOneOnOne} />
      <div className={styles.Content}>
        <div className={styles.Message}>{message}</div>
      </div>
      <div className={type === 'highlight' ? styles.UnreadDotHighlight : styles.UnreadDot} />
    </div>
  );
};
