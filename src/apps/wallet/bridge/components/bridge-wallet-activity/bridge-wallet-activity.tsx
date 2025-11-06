import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { useBridgeActivity } from '../../hooks/useBridgeActivity';
import { currentUserSelector } from '../../../../../store/authentication/selectors';
import {
  CHAIN_ID_ETHEREUM,
  CHAIN_ID_SEPOLIA,
  CHAIN_ID_ZCHAIN,
  CHAIN_ID_ZEPHYR,
  formatBridgeAmount,
  getBridgeStatusLabel,
  getChainIdFromName,
  getTokenInfo,
  openExplorerForTransaction,
} from '../../lib/utils';
import { BridgeStatusResponse } from '../../../queries/bridgeQueries';
import { IconButton } from '@zero-tech/zui/components';
import { IconLinkExternal1, IconClockRewind } from '@zero-tech/zui/icons';

import styles from './bridge-wallet-activity.module.scss';

interface BridgeWalletActivityProps {
  onActivityClick: (activity: BridgeStatusResponse) => void;
}

type FilterType = 'all' | 'pending';

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

  const getFormattedAmount = (activity: BridgeStatusResponse): string => {
    const fromChainId = getChainIdFromName(activity.fromChain);
    const tokenInfo = getTokenInfo(activity.tokenAddress, fromChainId);
    return formatBridgeAmount(activity.amount, tokenInfo.decimals);
  };

  const getTokenSymbol = (activity: BridgeStatusResponse): string => {
    const fromChainId = getChainIdFromName(activity.fromChain);
    const tokenInfo = getTokenInfo(activity.tokenAddress, fromChainId);
    return tokenInfo.symbol !== 'Unknown' ? tokenInfo.symbol : '';
  };

  const handleExplorerClick = (e: React.MouseEvent, activity: BridgeStatusResponse) => {
    e.stopPropagation();
    const fromChainId = getChainIdFromName(activity.fromChain);
    openExplorerForTransaction(activity.transactionHash, fromChainId, activity.explorerUrl);
  };

  const filteredActivities =
    filter === 'pending'
      ? activities.filter((a) => a.status === 'pending' || a.status === 'processing' || a.status === 'on-hold')
      : activities;

  const pendingCount = activities.filter(
    (a) => a.status === 'pending' || a.status === 'processing' || a.status === 'on-hold'
  ).length;

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

  const isActivityClickable = (status: string): boolean => {
    return status === 'pending' || status === 'processing' || status === 'on-hold' || status === 'failed';
  };

  return (
    <div className={styles.activitySection}>
      <div className={styles.activityHeader}>
        <IconClockRewind />
        <span>Activity</span>
      </div>

      <div className={styles.activityTabs}>
        <button className={filter === 'all' ? styles.tabActive : styles.tab} onClick={() => setFilter('all')}>
          All <span className={styles.tabCount}>{activities.length}</span>
        </button>
        <button className={filter === 'pending' ? styles.tabActive : styles.tab} onClick={() => setFilter('pending')}>
          Pending <span className={styles.tabCount}>{pendingCount}</span>
        </button>
      </div>

      {error ? (
        <div className={styles.emptyState}>Failed to load bridge activity.</div>
      ) : isLoading ? (
        <div className={styles.emptyState}>Loading...</div>
      ) : filteredActivities.length === 0 ? (
        <div className={styles.emptyState}>
          {filter === 'pending' ? 'No pending activity' : 'No bridge activity yet'}
        </div>
      ) : (
        <div className={styles.activityList}>
          {filteredActivities.map((activity) => {
            const isClickable = isActivityClickable(activity.status);
            return (
              <button
                key={activity.transactionHash}
                className={`${styles.activityItem} ${!isClickable ? styles.activityItemDisabled : ''}`}
                onClick={isClickable ? () => onActivityClick(activity) : undefined}
                disabled={!isClickable}
              >
                <div className={styles.activityItemHeader}>
                  <div className={styles.activityTitle}>Bridge to {activity.toChain}</div>
                  <div className={`${styles.activityStatus} ${getStatusClassName(activity.status)}`}>
                    {getBridgeStatusLabel(activity.status)}
                  </div>
                </div>
                <div className={styles.activityDetails}>
                  <div className={styles.activityAmount}>
                    {getFormattedAmount(activity)} {getTokenSymbol(activity)}
                  </div>
                  <div className={styles.activityChainsWithLink}>
                    <div className={styles.activityChains}>
                      {activity.fromChain} → {activity.toChain}
                    </div>
                    <IconButton Icon={IconLinkExternal1} onClick={(e) => handleExplorerClick(e, activity)} size={22} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
