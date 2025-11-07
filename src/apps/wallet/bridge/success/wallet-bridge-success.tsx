import { IconButton } from '@zero-tech/zui/components';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { IconXClose, IconChevronRightDouble, IconCheck, IconClockRewind } from '@zero-tech/zui/icons';
import {
  openExplorerForTransaction,
  formatAddress,
  getChainIdFromName,
  getTokenInfo,
  formatBridgeAmount,
  getWalletAddressForChain,
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
  transactionHash: string;
  fromChainId: number;
  onClose: () => void;
}

export const WalletBridgeSuccess = ({ transactionHash, fromChainId, onClose }: WalletBridgeSuccessProps) => {
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;
  const { address: eoaAddress } = useAccount();

  const { data: status } = useBridgeStatus({
    zeroWalletAddress,
    transactionHash,
    fromChainId,
    enabled: true,
    refetchInterval: false,
  });

  const statusFromChainId = status ? getChainIdFromName(status.fromChain) : fromChainId;
  const statusToChainId = status ? getChainIdFromName(status.toChain) : 0;
  const tokenInfo = status ? getTokenInfo(status.tokenAddress, statusFromChainId) : null;
  const formattedAmount = status && tokenInfo ? formatBridgeAmount(status.amount, tokenInfo.decimals) : '0';

  const fromChainName = status?.fromChain || 'Unknown';
  const toChainName = status?.toChain || 'Unknown';

  const fromWalletAddress = getWalletAddressForChain(statusFromChainId, eoaAddress, zeroWalletAddress);
  const toWalletAddress = status?.destinationAddress;

  const onViewTransaction = () => {
    openExplorerForTransaction(transactionHash, statusFromChainId, status?.explorerUrl);
  };

  const onViewClaimTransaction = () => {
    if (status?.claimTxHash) {
      openExplorerForTransaction(status.claimTxHash, statusToChainId);
    }
  };

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
