import { Avatar } from '@zero-tech/zui/components';
import { Notification } from '../../../store/notifications';
import { getNotificationContent } from './utils';
import classNames from 'classnames';
import { featureFlags } from '../../../lib/feature-flags';

import styles from './styles.module.scss';

export interface NotificationProps {
  notification: Notification;

  onClick: (roomId: string) => void;
}

export const NotificationItem = ({ notification, onClick }: NotificationProps) => {
  const content = getNotificationContent(notification);
  const timestamp = new Date(notification.createdAt).toLocaleString();

  const notificationClasses = classNames(styles.NotificationItem, {
    [styles.NotificationItemUnread]: !notification.isRead,
  });

  return (
    <div className={notificationClasses} onClick={() => onClick(notification.roomId)}>
      <Avatar size='medium' imageURL={notification.sender?.profileImage} />
      <div className={styles.Content}>
        <div>
          <div className={styles.Message}>{content}</div>
          <div className={styles.Timestamp}>{timestamp}</div>
        </div>
      </div>
      {featureFlags.enableNotificationsReadStatus && <div className={styles.UnreadDot} />}
    </div>
  );
};
