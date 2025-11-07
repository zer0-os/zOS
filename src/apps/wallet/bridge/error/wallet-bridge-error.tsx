import { IconButton, Skeleton } from '@zero-tech/zui/components';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { IconAlertCircle, IconXClose, IconClockRewind } from '@zero-tech/zui/icons';
import { openExplorerForTransaction, getChainIdFromName } from '../lib/utils';
import { Button } from '../../components/button/button';
import { useSelector } from 'react-redux';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useBridgeStatus } from '../hooks/useBridgeStatus';

import styles from './wallet-bridge-error.module.scss';

interface WalletBridgeErrorProps {
  depositCount: number | undefined;
  fromChainId: number;
  onClose: () => void;
}

export const WalletBridgeError = ({ depositCount, fromChainId, onClose }: WalletBridgeErrorProps) => {
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;

  const { data: status, isLoading: isLoadingStatus } = useBridgeStatus({
    zeroWalletAddress,
    depositCount,
    fromChainId,
    enabled: true,
    refetchInterval: false,
  });

  const onViewTransaction = () => {
    if (status?.transactionHash) {
      const statusFromChainId = status ? getChainIdFromName(status.fromChain) : fromChainId;
      openExplorerForTransaction(status.transactionHash, statusFromChainId, status?.explorerUrl);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className={styles.container}>
        <BridgeHeader title='Error' action={<IconButton Icon={IconXClose} onClick={onClose} />} />
        <div className={styles.content}>
          <div className={styles.errorDetails}>
            <div className={styles.status}>
              <Skeleton className={styles.statusIcon} style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <Skeleton style={{ width: 200, height: 20, marginBottom: 8 }} />
              <Skeleton style={{ width: 250, height: 16 }} />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <Skeleton style={{ width: 150, height: 36 }} />
          </div>
          <div className={styles.infoText}>Back to activity list</div>
          <div className={styles.buttonGroup}>
            <Button onClick={onClose} variant='secondary' icon={<IconClockRewind size={20} />}>
              Activity
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BridgeHeader title='Error' action={<IconButton Icon={IconXClose} onClick={onClose} />} />
      <div className={styles.content}>
        <div className={styles.errorDetails}>
          <div className={styles.status}>
            <span className={styles.statusIcon}>
              <IconAlertCircle />
            </span>
            <div className={styles.statusText}>Bridge Transaction Failed</div>
            <div className={styles.description}>
              Your bridge transaction failed. Check the explorer for more details.
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          {status?.explorerUrl && (
            <Button onClick={onViewTransaction} variant='secondary'>
              View Transaction
            </Button>
          )}
        </div>
        <div className={styles.infoText}>Back to activity list</div>
        <div className={styles.buttonGroup}>
          <Button onClick={onClose} variant='secondary' icon={<IconClockRewind size={20} />}>
            Activity
          </Button>
        </div>
      </div>
    </div>
  );
};
