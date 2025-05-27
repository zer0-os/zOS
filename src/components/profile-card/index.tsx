import { useProfileCard } from './lib/useProfileCard';
import { Button, SkeletonText, Variant } from '@zero-tech/zui/components';

import styles from './styles.module.scss';
import { MatrixAvatar } from '../matrix-avatar';

export interface ProfileCardProps {
  userId: string;
}

export const ProfileCard = ({ userId }: ProfileCardProps) => {
  const {
    followerCount,
    followingCount,
    handle,
    isFollowing,
    isLoading,
    isOwnProfile,
    onClickAvatar,
    onClickFollow,
    profileImage,
    subhandle,
  } = useProfileCard(userId);

  return (
    <div className={styles.Container} onClick={(e) => e.stopPropagation()}>
      <div className={styles.Header}>
        <div onClick={onClickAvatar} data-testid='profile-avatar'>
          <MatrixAvatar className={styles.Avatar} imageURL={profileImage} size='regular' />
        </div>
        {!isOwnProfile && !isLoading && (
          <Button variant={Variant.Primary} onPress={onClickFollow}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>
      <div className={styles.Name}>
        <SkeletonText className={styles.Handle} asyncText={{ text: handle, isLoading }} />
        <SkeletonText className={styles.Subhandle} asyncText={{ text: subhandle, isLoading }} />
      </div>
      <div className={styles.Follows}>
        <div className={styles.Count} data-testid='follower-count'>
          <SkeletonText asyncText={{ text: followerCount, isLoading }} /> <label>Followers</label>
        </div>
        <div className={styles.Count} data-testid='following-count'>
          <SkeletonText asyncText={{ text: followingCount, isLoading }} /> <label>Following</label>
        </div>
      </div>
    </div>
  );
};
