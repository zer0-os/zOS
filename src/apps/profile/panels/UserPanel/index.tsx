import React, { useState, useEffect } from 'react';
import { useUserPanel } from './useUserPanel';

import { Panel, PanelBody } from '../../../../components/layout/panel';
import { MatrixAvatar } from '../../../../components/matrix-avatar';
import { IconLogoZero } from '@zero-tech/zui/icons';
import MatrixMask from './matrix-mask.svg?react';
import { FollowButton } from '../../../../components/follow-button';
import { FollowCounts } from '../../../../components/follow-counts';
import { Skeleton } from '@zero-tech/zui/components/Skeleton';
import { Follows } from './Follows';

import styles from './styles.module.scss';

type FollowType = 'followers' | 'following';

export const UserPanel = () => {
  const { handle, profileImageUrl, zid, isLoading, userId, isCurrentUser, followersCount, followingCount } =
    useUserPanel();
  const [activeFollowType, setActiveFollowType] = useState<FollowType | null>(null);

  useEffect(() => {
    setActiveFollowType(null);
  }, [userId]);

  if (activeFollowType && userId) {
    return <Follows type={activeFollowType} userId={userId} onBack={() => setActiveFollowType(null)} />;
  }

  return (
    <Panel className={styles.Container}>
      <PanelBody className={styles.Body}>
        <div>
          <IconLogoZero size={18} />
          <div className={styles.Header}>
            <MatrixAvatar className={styles.Avatar} imageURL={profileImageUrl} size='regular' />
            <MatrixMask className={styles.Mask} />
          </div>
          <div className={styles.Name}>
            <h1>{isLoading ? <Skeleton /> : handle}</h1>
            <h2>{isLoading ? <Skeleton /> : zid ? '0://' + zid : null}</h2>
          </div>
          {!isLoading && userId && (
            <div className={styles.FollowContainer}>
              {isLoading ? (
                <Skeleton className={styles.FollowCounts} />
              ) : (
                <FollowCounts
                  followingCount={followingCount}
                  followersCount={followersCount}
                  className={styles.FollowCounts}
                  onFollowingClick={() => setActiveFollowType('following')}
                  onFollowersClick={() => setActiveFollowType('followers')}
                />
              )}
              {!isCurrentUser && <FollowButton targetUserId={userId} className={styles.FollowButton} />}
            </div>
          )}
        </div>
      </PanelBody>
    </Panel>
  );
};
