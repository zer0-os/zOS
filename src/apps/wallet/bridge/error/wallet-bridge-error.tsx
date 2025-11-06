import { IconButton } from '@zero-tech/zui/components';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { IconAlertCircle, IconXClose } from '@zero-tech/zui/icons';
import { openExplorerForTransaction } from '../lib/utils';
import { Button } from '../../components/button/button';
import { useSelector } from 'react-redux';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useBridgeStatus } from '../hooks/useBridgeStatus';

import styles from './wallet-bridge-error.module.scss';

interface WalletBridgeErrorProps {
  transactionHash: string;
  fromChainId: number;
  onClose: () => void;
}

export const WalletBridgeError = ({ transactionHash, fromChainId, onClose }: WalletBridgeErrorProps) => {
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;

  const { data: status } = useBridgeStatus({
    zeroWalletAddress,
    transactionHash,
    fromChainId,
    enabled: true,
    refetchInterval: false,
  });

  const onViewTransaction = () => {
    openExplorerForTransaction(transactionHash, fromChainId, status?.explorerUrl);
  };

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

        <div className={styles.actions}>
          <Button onClick={onClose}>Close</Button>
          {status?.explorerUrl && (
            <Button onClick={onViewTransaction} variant='secondary'>
              View Transaction
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
