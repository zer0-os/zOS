import { Avatar } from '@zero-tech/zui/components';
import { Channel } from '../../../store/channels';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import styles from './styles.module.scss';

export interface NotificationProps {
  conversation: Channel;

  onClick: (roomId: string) => void;
}

export const NotificationItem = ({ conversation, onClick }: NotificationProps) => {
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

  const notificationMessage = getNotificationMessage(conversation.unreadCount, getName(), conversation.isOneOnOne);

  return (
    <div className={styles.NotificationItem} onClick={() => onClick(conversation.id)}>
      <Avatar size='regular' imageURL={getAvatarUrl()} isGroup={!conversation.isOneOnOne} />
      <div className={styles.Content}>
        <div>
          <div className={styles.Message}>{notificationMessage}</div>
        </div>
      </div>
      <div className={styles.UnreadDot} />
    </div>
  );
};

const getNotificationMessage = (unreadCount: number, roomName: string, isOneOnOne: boolean) => {
  const notificationText = unreadCount === 1 ? 'notification' : 'notifications';

  if (isOneOnOne) {
    return `${unreadCount} unread ${notificationText} in your conversation with ${roomName}`;
  }

  return `${unreadCount} unread ${notificationText} in the ${roomName} channel`;
};
