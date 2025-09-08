import { TokenLoadingSpinner } from '../token-loading-spinner';

import styles from './styles.module.scss';

export const TokenProcessingTransaction = () => {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <TokenLoadingSpinner />

        <div className={styles.Title}>Creating your token</div>
        <div className={styles.Subtitle}>Just a moment...</div>
      </div>
    </div>
  );
};
