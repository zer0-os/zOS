import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { useBridgeActivity } from '../../hooks/useBridgeActivity';
import { currentUserSelector } from '../../../../../store/authentication/selectors';
import { CHAIN_ID_ETHEREUM, CHAIN_ID_SEPOLIA, CHAIN_ID_ZCHAIN, CHAIN_ID_ZEPHYR } from '../../lib/utils';
import { BridgeStatusResponse } from '../../../queries/bridgeQueries';
import { ActivityItem } from './activity-item';

import styles from './bridge-wallet-activity.module.scss';

interface BridgeWalletActivityProps {
  onActivityClick: (activity: BridgeStatusResponse) => void;
}

type FilterType = 'all' | 'pending' | 'completed';

export const BridgeWalletActivity = ({ onActivityClick }: BridgeWalletActivityProps) => {
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;
  const { chainId } = useAccount();
  const [filter, setFilter] = useState<FilterType>('all');

  const isMainnet = chainId === CHAIN_ID_ETHEREUM || chainId === CHAIN_ID_ZCHAIN;
  const l1ChainId = isMainnet ? CHAIN_ID_ETHEREUM : CHAIN_ID_SEPOLIA;
  const l2ChainId = isMainnet ? CHAIN_ID_ZCHAIN : CHAIN_ID_ZEPHYR;

  // Fetch L1 activities (Ethereum or Sepolia)
  const {
    data: l1Data,
    isLoading: l1Loading,
    error: l1Error,
  } = useBridgeActivity({
    zeroWalletAddress,
    fromChainId: l1ChainId,
    enabled: true,
  });

  // Fetch L2 activities (Z-Chain or Zephyr)
  const {
    data: l2Data,
    isLoading: l2Loading,
    error: l2Error,
  } = useBridgeActivity({
    zeroWalletAddress,
    fromChainId: l2ChainId,
    enabled: true,
  });

  // Merge and sort activities by block number (most recent first)
  const allActivities = [
    ...(l1Data?.deposits || []),
    ...(l2Data?.deposits || []),
  ].sort((a, b) => parseInt(b.blockNumber) - parseInt(a.blockNumber));

  const isLoading = l1Loading || l2Loading;
  const error = l1Error || l2Error;
  const activities = allActivities;

  const filteredActivities =
    filter === 'pending'
      ? activities.filter((a) => a.status === 'pending' || a.status === 'processing' || a.status === 'on-hold')
      : filter === 'completed'
      ? activities.filter((a) => a.status === 'completed')
      : activities;

  const pendingCount = activities.filter(
    (a) => a.status === 'pending' || a.status === 'processing' || a.status === 'on-hold'
  ).length;

  const completedCount = activities.filter((a) => a.status === 'completed').length;

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'processing':
      case 'on-hold':
      case 'pending':
        return styles.statusPending;
      case 'failed':
        return styles.statusFailed;
      default:
        return '';
    }
  };

  return (
    <div className={styles.activitySection}>
      <div className={styles.activityHeaderRow}>
        <div className={styles.activityHeader}>
          <span>Activity</span>
        </div>

        <div className={styles.activityTabs}>
          <button className={filter === 'all' ? styles.tabActive : styles.tab} onClick={() => setFilter('all')}>
            All <span className={styles.tabCount}>{activities.length}</span>
          </button>
          <button className={filter === 'pending' ? styles.tabActive : styles.tab} onClick={() => setFilter('pending')}>
            Pending <span className={styles.tabCount}>{pendingCount}</span>
          </button>
          <button
            className={filter === 'completed' ? styles.tabActive : styles.tab}
            onClick={() => setFilter('completed')}
          >
            Completed <span className={styles.tabCount}>{completedCount}</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className={styles.emptyState}>Failed to load bridge activity.</div>
      ) : isLoading ? (
        <div className={styles.emptyState}>Loading...</div>
      ) : filteredActivities.length === 0 ? (
        <div className={styles.emptyState}>
          {filter === 'pending'
            ? 'No pending activity'
            : filter === 'completed'
            ? 'No completed activity'
            : 'No bridge activity yet'}
        </div>
      ) : (
        <div className={styles.activityList}>
          {filteredActivities.map((activity) => (
            <ActivityItem
              key={activity.transactionHash}
              activity={activity}
              onActivityClick={onActivityClick}
              getStatusClassName={getStatusClassName}
            />
          ))}
        </div>
      )}
    </div>
  );
};
