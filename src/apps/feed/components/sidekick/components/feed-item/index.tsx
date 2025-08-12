import React from 'react';
import { useHistory } from 'react-router-dom';

import { IconArrowDown, IconArrowUp, IconUser, IconBarChart } from '@zero-tech/zui/icons';
import { setLastActiveFeed } from '../../../../../../lib/last-feed';
import { formatMarketCap, formatPriceChange, formatTokenPrice } from '../../lib/utils';

import styles from './styles.module.scss';

interface FeedItemProps {
  route: string;
  zid: string;
  isSelected?: boolean;
  memberCount?: number;
  tokenMarketCap?: number;
  tokenSymbol?: string;
  tokenPriceUsd?: number;
  tokenPriceChange?: number;
}

export const FeedItem = ({
  route,
  zid,
  isSelected,
  memberCount,
  tokenMarketCap,
  tokenSymbol,
  tokenPriceUsd,
  tokenPriceChange,
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
          <div className={styles.NameContainer}>
            <div className={styles.FeedName}>
              <div>{zid}</div>
            </div>
          </div>

          {tokenSymbol && <div className={styles.TokenSymbol}>{tokenSymbol}</div>}

          {tokenPriceUsd && <div className={styles.TokenPriceUsd}>{formatTokenPrice(tokenPriceUsd)}</div>}
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

          {tokenPriceChange && (
            <div className={styles.TokenPriceChangeContainer}>
              {tokenPriceChange >= 0 ? (
                <IconArrowUp className={`${styles.TokenPriceChangeIcon} ${styles.Up}`} size={14} />
              ) : (
                <IconArrowDown className={`${styles.TokenPriceChangeIcon} ${styles.Down}`} size={14} />
              )}

              <div className={`${styles.TokenPriceChange} ${tokenPriceChange >= 0 ? styles.Up : styles.Down}`}>
                {formatPriceChange(tokenPriceChange)}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};
