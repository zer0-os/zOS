import { BridgeStatusResponse } from '../../../queries/bridgeQueries';
import { IconButton } from '@zero-tech/zui/components';
import { IconChevronRight, IconLinkExternal1 } from '@zero-tech/zui/icons';
import { TokenIcon } from '../../../components/token-icon/token-icon';
import { FormattedNumber } from '../../../components/formatted-number/formatted-number';
import {
  formatBridgeAmount,
  getBridgeStatusLabel,
  getChainIdFromName,
  getTokenInfo,
  openExplorerForTransaction,
  CHAIN_NAMES,
} from '../../lib/utils';

import styles from './bridge-wallet-activity.module.scss';

interface ActivityItemProps {
  activity: BridgeStatusResponse;
  onActivityClick: (activity: BridgeStatusResponse) => void;
  getStatusClassName: (status: string) => string;
}

export const ActivityItem = ({ activity, onActivityClick, getStatusClassName }: ActivityItemProps) => {
  const fromChainId = getChainIdFromName(activity.fromChain);
  const toChainId = getChainIdFromName(activity.toChain);

  // Get token info from curated tokens, trying both chains
  // Try fromChainId first since that's where the token originated
  let tokenInfo = fromChainId ? getTokenInfo(activity.tokenAddress, fromChainId) : null;
  if (!tokenInfo || tokenInfo.symbol === 'Unknown') {
    tokenInfo = toChainId ? getTokenInfo(activity.tokenAddress, toChainId) : null;
  }

  // Fallback if both lookups failed
  if (!tokenInfo || tokenInfo.symbol === 'Unknown') {
    tokenInfo = {
      symbol: 'Unknown',
      name: 'Unknown Token',
      decimals: 18,
    };
  }
  const formattedAmount = formatBridgeAmount(activity.amount, tokenInfo.decimals);

  const handleFromChainExplorerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openExplorerForTransaction(activity.transactionHash, fromChainId, activity.explorerUrl);
  };

  const handleToChainExplorerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activity.claimTxHash) {
      openExplorerForTransaction(activity.claimTxHash, toChainId);
    }
  };

  return (
    <div
      key={activity.transactionHash}
      className={styles.activityItem}
      onClick={() => onActivityClick(activity)}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivityClick(activity);
        }
      }}
    >
      <div className={styles.activityDetails}>
        <TokenIcon className={styles.tokenIcon} url={tokenInfo.logo} name={tokenInfo.name} chainId={fromChainId} />
        <div className={styles.activityInfo}>
          <div className={`${styles.activityStatus} ${getStatusClassName(activity.status)}`}>
            {getBridgeStatusLabel(activity.status)}
          </div>
          <div className={styles.activityAmount}>
            <FormattedNumber value={formattedAmount} /> {tokenInfo.symbol}
          </div>
        </div>
        <div className={styles.activityChains}>
          <div className={styles.chainRow}>
            <IconButton Icon={IconLinkExternal1} onClick={handleFromChainExplorerClick} size={18} />
            <span>{fromChainId ? CHAIN_NAMES[fromChainId] : activity.fromChain}</span>
            <IconChevronRight size={16} />
            <span>{toChainId ? CHAIN_NAMES[toChainId] : activity.toChain}</span>
            {activity.claimTxHash && (
              <IconButton Icon={IconLinkExternal1} onClick={handleToChainExplorerClick} size={18} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
