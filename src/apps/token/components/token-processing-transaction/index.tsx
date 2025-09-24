import { TokenLoadingSpinner } from '../token-loading-spinner';

import styles from './styles.module.scss';

interface TokenProcessingTransactionProps {
  title?: string;
  subtitle?: string;
}

export const TokenProcessingTransaction = ({ title, subtitle }: TokenProcessingTransactionProps) => {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <TokenLoadingSpinner />

        <div className={styles.Title}>{title}</div>
        <div className={styles.Subtitle}>{subtitle}</div>
      </div>
    </div>
  );
};
