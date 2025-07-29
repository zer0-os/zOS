import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

import { IconBellOff1, IconUser } from '@zero-tech/zui/icons';
import { setLastActiveFeed } from '../../../../../../lib/last-feed';

import styles from './styles.module.scss';

interface FeedItemProps {
  route: string;
  children: ReactNode;
  isSelected?: boolean;
  zid: string;
  memberCount?: number;
  isMuted?: boolean;
  hasUnreadHighlights?: boolean;
  hasUnreadTotal?: boolean;
  unreadCount?: number;
  unreadHighlight?: number;
}

export const FeedItem = ({
  route,
  children,
  isSelected,
  zid,
  memberCount,
  isMuted,
  hasUnreadHighlights,
  hasUnreadTotal,
  unreadCount,
  unreadHighlight,
}: FeedItemProps) => {
  const history = useHistory();

  const handleOnClick = () => {
    setLastActiveFeed(zid);
    history.push(route);
  };

  return (
    <li
      className={`${styles.FeedItem} ${isSelected ? styles.FeedItemActive : ''}`}
      tabIndex={0}
      onClick={handleOnClick}
    >
      <div className={styles.Content}>
        <div className={styles.Header}>
          <div className={styles.NameContainer}>{children}</div>

          <div className={styles.UnreadContainer}>
            {isMuted && <IconBellOff1 className={styles.MutedIcon} size={14} />}
            {!hasUnreadHighlights && hasUnreadTotal && <div className={styles.UnreadCount}>{unreadCount}</div>}
            {hasUnreadHighlights && <div className={styles.UnreadHighlight}>{unreadHighlight}</div>}
          </div>
        </div>

        <div className={styles.IconsContainer}>
          {memberCount !== undefined && (
            <div className={styles.MemberCountContainer}>
              <IconUser className={styles.MemberCountIcon} size={12} />
              <div className={styles.MemberCount}>{memberCount.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};
