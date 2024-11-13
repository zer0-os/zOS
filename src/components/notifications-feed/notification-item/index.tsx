import { Avatar } from '@zero-tech/zui/components';
import styles from './styles.module.scss';

export interface NotificationProps {
  content: string;
}

export const NotificationItem = ({ content }: NotificationProps) => {
  return (
    <div className={styles.NotificationItem}>
      <Avatar size='medium' imageURL={''} />
      {content}
    </div>
  );
};
