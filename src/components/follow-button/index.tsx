import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFollow } from '../../apps/profile/lib/useFollow';
import { Skeleton } from '@zero-tech/zui/components/Skeleton';
import styles from './styles.module.scss';

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ targetUserId, className }) => {
  const { isFollowing, isLoading, follow, unfollow } = useFollow(targetUserId);

  return (
    <motion.div
      className={`${styles.Container} ${isFollowing && styles.Following} ${isLoading && styles.Disabled} ${
        className || ''
      }`}
      whileHover={{ scale: isLoading ? 1 : 1.01 }}
      onClick={isLoading ? () => {} : isFollowing ? unfollow : follow}
    >
      <AnimatePresence mode='wait'>
        {isLoading ? (
          <div className={styles.Text} style={{ width: '80px' }}>
            <Skeleton data-testid='skeleton' />
          </div>
        ) : (
          <motion.span
            key={isFollowing ? 'unfollow' : 'follow'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.Text}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
