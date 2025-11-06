import { BridgeStatusResponse } from '../../../queries/bridgeQueries';
import { IconButton } from '@zero-tech/zui/components';
import { IconChevronRight, IconLinkExternal1 } from '@zero-tech/zui/icons';
import { TokenIcon } from '../../../components/token-icon/token-icon';
import {
  formatBridgeAmount,
  getBridgeStatusLabel,
  getChainIdFromName,
  getTokenInfo,
  openExplorerForTransaction,
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
  const tokenInfo = getTokenInfo(activity.tokenAddress, fromChainId);
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
    <button key={activity.transactionHash} className={styles.activityItem} onClick={() => onActivityClick(activity)}>
      <div className={styles.activityItemHeader}>
        <div className={styles.activityTitle}>Bridge to {activity.toChain}</div>
        <div className={`${styles.activityStatus} ${getStatusClassName(activity.status)}`}>
          {getBridgeStatusLabel(activity.status)}
        </div>
      </div>
      <div className={styles.activityDetails}>
        <div className={styles.activityAmount}>
          <TokenIcon className={styles.tokenIcon} url={tokenInfo.logo} name={tokenInfo.symbol} />
          <span>
            {formattedAmount} {tokenInfo.symbol}
          </span>
        </div>
        <div className={styles.activityChains}>
          <IconButton Icon={IconLinkExternal1} onClick={handleFromChainExplorerClick} size={22} />
          {activity.fromChain}
          <IconChevronRight size={16} />
          {activity.toChain}
          {activity.claimTxHash && (
            <IconButton Icon={IconLinkExternal1} onClick={handleToChainExplorerClick} size={22} />
          )}
        </div>
      </div>
    </button>
  );
};
