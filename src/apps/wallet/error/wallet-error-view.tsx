import { useDispatch, useSelector } from 'react-redux';
import { PanelBody } from '../../../components/layout/panel';
import styles from './wallet-error-view.module.scss';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Button } from '../components/button/button';
import { reset } from '../../../store/wallet';
import { errorCodeSelector } from '../../../store/wallet/selectors';
import { useMemo } from 'react';

export const WalletErrorView = () => {
  const dispatch = useDispatch();
  const errorCode = useSelector(errorCodeSelector);

  const handleReset = () => {
    dispatch(reset());
  };

  const statusText = useMemo(() => {
    switch (errorCode) {
      case 'INSUFFICIENT_BALANCE':
        return 'Insufficient balance';
      default:
        return 'Unexpected error';
    }
  }, [errorCode]);

  const errorDescription = useMemo(() => {
    switch (errorCode) {
      case 'INSUFFICIENT_BALANCE':
        return 'Gas balance is not enough for this transaction';
      default:
        return 'Unexpected error';
    }
  }, [errorCode]);

  return (
    <PanelBody className={styles.walletErrorView}>
      <div className={styles.content}>
        <div className={styles.errorDetails}>
          <div className={styles.status}>
            <span className={styles.statusIcon}>
              <IconAlertCircle />
            </span>
            <div className={styles.statusText}>{statusText}</div>
            <div className={styles.description}>{errorDescription}</div>
          </div>
          <Button onClick={handleReset}>Try Again</Button>
        </div>
      </div>
    </PanelBody>
  );
};
