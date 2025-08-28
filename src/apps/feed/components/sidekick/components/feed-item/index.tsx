import React from 'react';
import { useHistory } from 'react-router-dom';

import { IconUser, IconBarChart } from '@zero-tech/zui/icons';
import { setLastActiveFeed } from '../../../../../../lib/last-feed';
import { formatMarketCap } from '../../lib/utils';

import styles from './styles.module.scss';

interface FeedItemProps {
  route: string;
  zid: string;
  isSelected?: boolean;
  memberCount?: number;
  tokenMarketCap?: number;
}

export const FeedItem = ({ route, zid, isSelected, memberCount, tokenMarketCap }: FeedItemProps) => {
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
    </li>
  );
};
