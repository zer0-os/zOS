import { useDispatch } from 'react-redux';
import { PanelBody } from '../../../components/layout/panel';
import styles from './wallet-error-view.module.scss';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Button } from '../components/button/button';
import { reset } from '../../../store/wallet';

export const WalletErrorView = () => {
  const dispatch = useDispatch();

  const handleReset = () => {
    dispatch(reset());
  };

  return (
    <PanelBody className={styles.walletErrorView}>
      <div className={styles.content}>
        <div className={styles.errorDetails}>
          <div className={styles.status}>
            <span className={styles.statusIcon}>
              <IconAlertCircle />
            </span>
            <div className={styles.statusText}>Unexpected Error</div>
            <div className={styles.description}>An unexpected error occurred. Please try again.</div>
          </div>
          <Button onClick={handleReset}>Try Again</Button>
        </div>
      </div>
    </PanelBody>
  );
};
