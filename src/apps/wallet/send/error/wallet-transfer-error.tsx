import { IconButton } from '@zero-tech/zui/components';
import { SendHeader } from '../components/send-header';
import { IconAlertCircle, IconHourglass2, IconXClose } from '@zero-tech/zui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { reset } from '../../../../store/wallet';
import { getHistory } from '../../../../lib/browser';
import { txReceiptSelector } from '../../../../store/wallet/selectors';
import { Button } from '../../components/button/button';
import classNames from 'classnames';
import styles from './wallet-transfer-error.module.scss';

const history = getHistory();

export const WalletTransferError = () => {
  const dispatch = useDispatch();
  const txReceipt = useSelector(txReceiptSelector);
  const isError = txReceipt?.status === 'failed';
  const isTimeout = txReceipt?.status === 'timeout';

  const handleClose = () => {
    dispatch(reset());
    history.push('/wallet');
  };

  const handleViewOnZScan = () => {
    window.open(txReceipt?.blockExplorerUrl, '_blank');
  };

  return (
    <div className={styles.container}>
      <SendHeader title='Error' action={<IconButton Icon={IconXClose} onClick={handleClose} />} />
      <div className={styles.content}>
        <div className={styles.errorDetails}>
          <div
            className={classNames(styles.status, {
              [styles.error]: isError,
              [styles.timeout]: isTimeout,
            })}
          >
            <span className={styles.statusIcon}>
              {isError && <IconAlertCircle />}
              {isTimeout && <IconHourglass2 />}
            </span>
            <div className={styles.statusText}>
              {isError && 'Transaction Failed'}
              {isTimeout && 'Transaction Timed Out'}
            </div>
            <div className={styles.description}>
              {isError && 'Your transaction failed. Check ZScan for more details.'}
              {isTimeout && 'Your transaction is taking longer than usual. Check ZScan for more details.'}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handleViewOnZScan}>View on ZScan</Button>
        </div>
      </div>
    </div>
  );
};
