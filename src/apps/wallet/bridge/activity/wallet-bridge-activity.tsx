import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { useBridgeActivity } from '../hooks/useBridgeActivity';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import {
  CHAIN_ID_SEPOLIA,
  formatBridgeAmount,
  getBridgeStatusLabel,
  getChainIdFromName,
  getTokenInfo,
  openExplorerForTransaction,
} from '../lib/utils';
import { BridgeStatusResponse } from '../../queries/bridgeQueries';
import { IconButton } from '@zero-tech/zui/components';
import { IconLinkExternal1 } from '@zero-tech/zui/icons';

import styles from './wallet-bridge-activity.module.scss';

interface WalletBridgeActivityProps {
  onBack: () => void;
  onActivityClick: (activity: BridgeStatusResponse) => void;
}

type FilterType = 'all' | 'pending';

export const WalletBridgeActivity = ({ onBack, onActivityClick }: WalletBridgeActivityProps) => {
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;
  const { chainId } = useAccount();
  const [filter, setFilter] = useState<FilterType>('all');

  // Use connected chain ID or default to Sepolia testnet
  const fromChainId = chainId || CHAIN_ID_SEPOLIA;

  const { data, isLoading, error } = useBridgeActivity({
    zeroWalletAddress,
    fromChainId,
    enabled: true,
  });

  const activities = data?.deposits || [];

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
    e.stopPropagation(); // Prevent activity item click
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
    <div className={styles.container}>
      <BridgeHeader title='Activity' onBack={onBack} />

      <div className={styles.content}>
        <div className={styles.tabs}>
          <button className={filter === 'all' ? styles.tabActive : styles.tab} onClick={() => setFilter('all')}>
            All <span className={styles.tabCount}>{activities.length}</span>
          </button>
          <button className={filter === 'pending' ? styles.tabActive : styles.tab} onClick={() => setFilter('pending')}>
            Pending <span className={styles.tabCount}>{pendingCount}</span>
          </button>
        </div>

        {error ? (
          <div className={styles.emptyState}>Failed to load bridge activity. Please try again later.</div>
        ) : isLoading ? (
          <div className={styles.emptyState}>Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
          <div className={styles.emptyState}>
            {filter === 'pending' ? 'No pending bridge activity' : 'Bridge activity will be shown here'}
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
                  <div className={styles.activityHeader}>
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
                      <IconButton
                        Icon={IconLinkExternal1}
                        onClick={(e) => handleExplorerClick(e, activity)}
                        size={22}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
