import { IconButton } from '@zero-tech/zui/components';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { IconXClose, IconChevronRightDouble, IconCheck } from '@zero-tech/zui/icons';
import { BridgeParams, CHAIN_NAMES, openExplorerForTransaction, formatAddress } from '../lib/utils';
import { Button } from '../../components/button/button';
import { TokenIcon } from '../../components/token-icon/token-icon';
import { FormattedNumber } from '../../components/formatted-number/formatted-number';
import { useSelector } from 'react-redux';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useBridgeStatus } from '../hooks/useBridgeStatus';

import styles from './wallet-bridge-success.module.scss';

interface WalletBridgeSuccessProps {
  bridgeParams: BridgeParams;
  transactionHash: string;
  onClose: () => void;
}

export const WalletBridgeSuccess = ({ bridgeParams, transactionHash, onClose }: WalletBridgeSuccessProps) => {
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;

  const { data: status } = useBridgeStatus({
    zeroWalletAddress,
    transactionHash,
    fromChainId: bridgeParams.fromChainId,
    enabled: true,
    refetchInterval: false,
  });

  const fromChainName = CHAIN_NAMES[bridgeParams.fromChainId] || 'Unknown';
  const toChainName = CHAIN_NAMES[bridgeParams.toChainId] || 'Unknown';

  const onViewTransaction = () => {
    openExplorerForTransaction(transactionHash, bridgeParams.fromChainId, status?.explorerUrl);
  };

  const onViewClaimTransaction = () => {
    if (status?.claimTxHash) {
      openExplorerForTransaction(status.claimTxHash, bridgeParams.toChainId);
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
              url={bridgeParams.fromToken?.logoUrl}
              name={bridgeParams.fromToken?.symbol || 'Token'}
              chainId={bridgeParams.fromChainId}
              className={styles.smallTokenIcon}
            />
            <div className={styles.tokenName}>
              {bridgeParams.fromToken?.name || bridgeParams.fromToken?.symbol || 'Token'}
            </div>
            <div className={styles.tokenAmount}>
              <FormattedNumber value={bridgeParams.amount || '0'} />
            </div>
            <div className={styles.chainName}>{fromChainName}</div>
            {bridgeParams.fromWalletAddress && (
              <div className={styles.walletAddress}>{formatAddress(bridgeParams.fromWalletAddress)}</div>
            )}
          </div>

          <div className={styles.tokenInfoSeparator}>
            <IconChevronRightDouble />
          </div>

          <div className={styles.tokenInfo}>
            <TokenIcon
              url={bridgeParams.toToken?.logoUrl}
              name={bridgeParams.toToken?.symbol || 'Token'}
              chainId={bridgeParams.toChainId}
              className={styles.smallTokenIcon}
            />
            <div className={styles.tokenName}>
              {bridgeParams.toToken?.name || bridgeParams.toToken?.symbol || 'Token'}
            </div>
            <div className={styles.tokenAmount}>
              <FormattedNumber value={bridgeParams.amount || '0'} />
            </div>
            <div className={styles.chainName}>{toChainName}</div>
            {bridgeParams.toWalletAddress && (
              <div className={styles.walletAddress}>{formatAddress(bridgeParams.toWalletAddress)}</div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.actions}>
            <Button onClick={onClose}>Close</Button>
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
          </div>
        </div>
      </div>
    </div>
  );
};
