import React from 'react';
import { useHistory } from 'react-router-dom';

import { IconUser, IconBarChart, IconLock } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';
import { setLastActiveFeed } from '../../../../../../lib/last-feed';
import { formatMarketCap } from '../../lib/utils';

import styles from './styles.module.scss';

interface FeedItemProps {
  route: string;
  zid: string;
  isSelected?: boolean;
  memberCount?: number;
  tokenSymbol?: string;
  tokenMarketCap?: number;
  onUpdateChannel?: (zid: string) => void;
  isOwner?: boolean;
}

export const FeedItem = ({
  route,
  zid,
  isSelected,
  memberCount,
  tokenMarketCap,
  tokenSymbol,
  onUpdateChannel,
  isOwner,
}: FeedItemProps) => {
  const history = useHistory();

  const handleOnClick = () => {
    setLastActiveFeed(zid);
    history.push(route);
  };

  const handleUpdateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateChannel?.(zid);
  };

  return (
    <li
      className={`${styles.FeedItem} ${isSelected ? styles.FeedItemActive : ''}`}
      tabIndex={0}
      onClick={handleOnClick}
    >
      <div className={styles.Content}>
        <div className={styles.Header}>
          <div className={styles.NameContainer}>
            <div className={styles.FeedName}>
              <div>{zid}</div>
            </div>
          </div>
        </div>

        <div className={styles.InfoContainer}>
          <div className={styles.InfoIconContainer}>
            {memberCount !== undefined && (
              <div className={styles.TotalCountContainer}>
                <IconUser className={styles.TotalCountIcon} size={14} />
                <div className={styles.TotalCount}>{memberCount.toLocaleString()}</div>
              </div>
            )}

            {tokenMarketCap && (
              <div className={styles.TotalCountContainer}>
                <IconBarChart className={styles.TotalCountIcon} size={14} />

                <div className={styles.TotalCount}>{formatMarketCap(tokenMarketCap)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!tokenSymbol && isOwner && onUpdateChannel && (
        <div className={styles.UpdateButtonContainer}>
          <IconButton
            size={24}
            Icon={IconLock}
            onClick={handleUpdateClick}
            aria-label='Update channel token gating'
            className={styles.UpdateButton}
          />
        </div>
      )}
    </li>
  );
};
