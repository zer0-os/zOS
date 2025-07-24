import { IconMessage01 } from '@zero-tech/zui/icons';
import { Button, SkeletonText, Variant, IconButton } from '@zero-tech/zui/components';

import { MatrixAvatar } from '../matrix-avatar';
import { ZeroProBadge } from '../zero-pro-badge';
import { useProfileCard } from './lib/useProfileCard';

import styles from './styles.module.scss';

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
    isLoadingFollowing,
    isMutating,
    isOwnProfile,
    onClickAvatar,
    onClickChat,
    onClickFollow,
    profileImage,
    subhandle,
    isZeroProSubscriber,
  } = useProfileCard(userId);

  return (
    <div className={styles.Container} onClick={(e) => e.stopPropagation()}>
      <div className={styles.Header}>
        <div onClick={onClickAvatar} data-testid='profile-avatar'>
          <MatrixAvatar className={styles.Avatar} imageURL={profileImage} size='regular' />
        </div>
        {!isOwnProfile && !isLoading && (
          <div className={styles.Actions} data-testid='profile-actions'>
            {!isLoadingFollowing && (
              <Button
                aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
                variant={Variant.Primary}
                onPress={onClickFollow}
                isDisabled={isMutating}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
            <IconButton
              Icon={IconMessage01}
              onClick={onClickChat}
              aria-label='Open conversation with user'
              size={32}
              className={styles.ChatButton}
            />
          </div>
        )}
      </div>
      <div className={styles.Name}>
        <div className={styles.NameAndBadgeWrapper}>
          <SkeletonText className={styles.Handle} asyncText={{ text: handle, isLoading }} />
          {isZeroProSubscriber && !isLoading && <ZeroProBadge size={18} />}
        </div>
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
