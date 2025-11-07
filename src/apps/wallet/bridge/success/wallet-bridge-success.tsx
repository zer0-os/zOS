import { IconButton, Skeleton } from '@zero-tech/zui/components';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { IconXClose, IconChevronRightDouble, IconCheck, IconClockRewind } from '@zero-tech/zui/icons';
import {
  openExplorerForTransaction,
  formatAddress,
  getChainIdFromName,
  getTokenInfo,
  formatBridgeAmount,
  getWalletAddressForChain,
  CHAIN_NAMES,
} from '../lib/utils';
import { Button } from '../../components/button/button';
import { TokenIcon } from '../../components/token-icon/token-icon';
import { FormattedNumber } from '../../components/formatted-number/formatted-number';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useBridgeStatus } from '../hooks/useBridgeStatus';

import styles from './wallet-bridge-success.module.scss';

interface WalletBridgeSuccessProps {
  depositCount: number | undefined;
  fromChainId: number;
  onClose: () => void;
}

export const WalletBridgeSuccess = ({ depositCount, fromChainId, onClose }: WalletBridgeSuccessProps) => {
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;
  const { address: eoaAddress } = useAccount();

  const { data: status, isLoading: isLoadingStatus } = useBridgeStatus({
    zeroWalletAddress,
    depositCount,
    fromChainId,
    enabled: true,
    refetchInterval: false,
  });

  const statusFromChainId = status ? getChainIdFromName(status.fromChain) : fromChainId;
  const statusToChainId = status ? getChainIdFromName(status.toChain) : 0;

  const tokenInfo = status
    ? getTokenInfo(status.tokenAddress, statusToChainId) || getTokenInfo(status.tokenAddress, statusFromChainId)
    : null;

  const formattedAmount = status && tokenInfo ? formatBridgeAmount(status.amount, tokenInfo.decimals) : '0';

  const fromChainName = statusFromChainId ? CHAIN_NAMES[statusFromChainId] : status?.fromChain || 'Unknown';
  const toChainName = statusToChainId ? CHAIN_NAMES[statusToChainId] : status?.toChain || 'Unknown';

  const fromWalletAddress = getWalletAddressForChain(statusFromChainId, eoaAddress, zeroWalletAddress);
  const toWalletAddress = status?.destinationAddress;

  const onViewTransaction = () => {
    if (status?.transactionHash) {
      openExplorerForTransaction(status.transactionHash, statusFromChainId, status?.explorerUrl);
    }
  };

  const onViewClaimTransaction = () => {
    if (status?.claimTxHash) {
      openExplorerForTransaction(status.claimTxHash, statusToChainId);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className={styles.container}>
        <BridgeHeader title='Bridge Complete' action={<IconButton Icon={IconXClose} onClick={onClose} />} />
        <div className={styles.content}>
          <div className={styles.status}>
            <Skeleton className={styles.statusIcon} style={{ width: 24, height: 24, borderRadius: '50%' }} />
            <Skeleton style={{ width: 200, height: 20 }} />
          </div>

          <div className={styles.transferDetails}>
            <div className={styles.tokenInfo}>
              <Skeleton className={styles.smallTokenIcon} style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <Skeleton style={{ width: 100, height: 18 }} />
              <Skeleton style={{ width: 80, height: 12 }} />
              <Skeleton style={{ width: 60, height: 14 }} />
            </div>

            <div className={styles.tokenInfoSeparator}>
              <IconChevronRightDouble />
            </div>

            <div className={styles.tokenInfo}>
              <Skeleton className={styles.smallTokenIcon} style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <Skeleton style={{ width: 100, height: 18 }} />
              <Skeleton style={{ width: 80, height: 12 }} />
              <Skeleton style={{ width: 60, height: 14 }} />
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.actions}>
              <Skeleton style={{ width: 120, height: 36 }} />
              <Skeleton style={{ width: 120, height: 36 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BridgeHeader title='Bridge Complete' action={<IconButton Icon={IconXClose} onClick={onClose} />} />
      <div className={styles.content}>
        <div className={styles.status}>
          <div className={styles.statusIcon}>
            <IconCheck />
          </div>
          <div className={styles.statusText}>Bridge Completed Successfully</div>
        </div>

        <div className={styles.transferDetails}>
          <div className={styles.tokenInfo}>
            <TokenIcon
              url={tokenInfo?.logo}
              name={tokenInfo?.symbol || 'Token'}
              chainId={statusFromChainId}
              className={styles.smallTokenIcon}
            />
            <div className={styles.tokenName}>{tokenInfo?.name || tokenInfo?.symbol || 'Token'}</div>
            <div className={styles.tokenAmount}>
              <FormattedNumber value={formattedAmount} />
            </div>
            <div className={styles.chainName}>{fromChainName}</div>
            {fromWalletAddress && <div className={styles.walletAddress}>{formatAddress(fromWalletAddress)}</div>}
          </div>

          <div className={styles.tokenInfoSeparator}>
            <IconChevronRightDouble />
          </div>

          <div className={styles.tokenInfo}>
            <TokenIcon
              url={tokenInfo?.logo}
              name={tokenInfo?.symbol || 'Token'}
              chainId={statusToChainId}
              className={styles.smallTokenIcon}
            />
            <div className={styles.tokenName}>{tokenInfo?.name || tokenInfo?.symbol || 'Token'}</div>
            <div className={styles.tokenAmount}>
              <FormattedNumber value={formattedAmount} />
            </div>
            <div className={styles.chainName}>{toChainName}</div>
            {toWalletAddress && <div className={styles.walletAddress}>{formatAddress(toWalletAddress)}</div>}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.actions}>
            {status?.explorerUrl && (
              <Button onClick={onViewTransaction} variant='secondary'>
                View Transaction
              </Button>
            )}
            {status?.claimTxHash && (
              <Button onClick={onViewClaimTransaction} variant='secondary'>
                View Claim
              </Button>
            )}
            <Button onClick={onClose} variant='secondary' icon={<IconClockRewind size={20} />}>
              Activity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
