import { Avatar } from '@zero-tech/zui/components';
import { Notification } from '../../../store/notifications';
import { getNotificationContent } from './utils';

import styles from './styles.module.scss';

export interface NotificationProps {
  notification: Notification;

  onClick: (roomId: string) => void;
}

export const NotificationItem = ({ notification, onClick }: NotificationProps) => {
  const content = getNotificationContent(notification);
  const timestamp = new Date(notification.createdAt).toLocaleString();

  return (
    <div className={styles.NotificationItem} onClick={() => onClick(notification.roomId)}>
      <Avatar size='medium' imageURL={notification.sender?.profileImage} />
      <div className={styles.Content}>
        <div className={styles.Message}>{content}</div>
        <div className={styles.Timestamp}>{timestamp}</div>
      </div>
    </div>
  );
};
