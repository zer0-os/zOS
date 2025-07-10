import { useSelector } from 'react-redux';
import { sendStageSelector } from '../../../../store/wallet/selectors';
import { SendStage } from '../../../../store/wallet';
import { TransactionLoadingSpinner } from '../components/transaction-loading-spinner';

import styles from './wallet-processing-transaction.module.scss';

export const WalletProcessingTransaction = () => {
  const stage = useSelector(sendStageSelector);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <TransactionLoadingSpinner />

        <div className={styles.title}>
          {stage === SendStage.Processing ? 'Starting your transaction' : 'Broadcasting your transaction'}
        </div>
        <div className={styles.subtitle}>Just a moment.</div>
      </div>
    </div>
  );
};
