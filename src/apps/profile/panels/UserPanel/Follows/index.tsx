import React from 'react';
import { Panel, PanelBody } from '../../../../../components/layout/panel';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { CitizenListItem } from '../../../../../components/citizen-list-item';
import { ScrollbarContainer } from '../../../../../components/scrollbar-container';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { Waypoint } from '../../../../../components/waypoint';
import { useFollowList } from '../../../lib/useFollowList';

import styles from './styles.module.scss';

interface FollowsProps {
  type: 'followers' | 'following';
  userId: string;
  onBack: () => void;
}

export const Follows: React.FC<FollowsProps> = ({ type, userId, onBack }) => {
  const { users, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, error } = useFollowList(userId, type);

  const title = type === 'followers' ? 'Followers' : 'Following';

  if (error) {
    return <div>Unable to load {title}</div>;
  }

  return (
    <Panel className={styles.Container}>
      <PanelBody className={styles.Body}>
        <div>
          <div className={styles.Header}>
            <button className={styles.BackButton} onClick={onBack}>
              <IconArrowLeft size={18} />
            </button>
            <span className={styles.Label}>{title}</span>
          </div>
          <div className={styles.List}>
            {isLoading ? (
              <div className={styles.Loading}>
                <Spinner />
              </div>
            ) : (
              <ScrollbarContainer>
                {users.map((user) => (
                  <CitizenListItem key={user.userId} user={user} />
                ))}
                {hasNextPage && (
                  <div className={styles.WaypointContainer}>
                    <Waypoint onEnter={fetchNextPage} />
                  </div>
                )}
                {isFetchingNextPage && (
                  <div className={styles.LoadingMore}>
                    <Spinner />
                  </div>
                )}
              </ScrollbarContainer>
            )}
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
};
