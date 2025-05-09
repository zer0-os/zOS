import React from 'react';
import styles from './styles.module.scss';

interface FollowCountsProps {
  followingCount: number;
  followersCount: number;
  showFollowing?: boolean;
  showFollowers?: boolean;
  className?: string;
}

export const FollowCounts: React.FC<FollowCountsProps> = ({
  followingCount,
  followersCount,
  showFollowing = true,
  showFollowers = true,
  className,
}) => {
  return (
    <div className={`${styles.FollowCounts} ${className || ''}`}>
      {showFollowing && (
        <div className={styles.count}>
          <span className={styles.number}>{followingCount}</span>
          <span className={styles.label}>Following</span>
        </div>
      )}
      {showFollowers && (
        <div className={styles.count}>
          <span className={styles.number}>{followersCount}</span>
          <span className={styles.label}>Followers</span>
        </div>
      )}
    </div>
  );
};
