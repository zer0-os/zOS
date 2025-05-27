import React from 'react';
import styles from './styles.module.scss';

interface FollowCountsProps {
  followingCount: number;
  followersCount: number;
  showFollowing?: boolean;
  showFollowers?: boolean;
  className?: string;
  onFollowingClick?: () => void;
  onFollowersClick?: () => void;
}

export const FollowCounts: React.FC<FollowCountsProps> = ({
  followingCount,
  followersCount,
  showFollowing = true,
  showFollowers = true,
  className,
  onFollowingClick,
  onFollowersClick,
}) => {
  const hasFollowers = followersCount > 0;
  const hasFollowing = followingCount > 0;

  const followingClick = () => {
    if (hasFollowing) {
      onFollowingClick?.();
    }
  };

  const followersClick = () => {
    if (hasFollowers) {
      onFollowersClick?.();
    }
  };

  return (
    <div className={`${styles.FollowCounts} ${className || ''}`}>
      {showFollowing && (
        <div className={`${styles.count} ${hasFollowing ? styles.clickable : ''}`} onClick={followingClick}>
          <span className={styles.number}>{followingCount}</span>
          <span className={styles.label}>Following</span>
        </div>
      )}
      {showFollowers && (
        <div className={`${styles.count} ${hasFollowers ? styles.clickable : ''}`} onClick={followersClick}>
          <span className={styles.number}>{followersCount}</span>
          <span className={styles.label}>Followers</span>
        </div>
      )}
    </div>
  );
};
