import styles from './transaction-skeleton.module.scss';
import { Skeleton } from '@zero-tech/zui/components';

export const TransactionSkeleton = () => {
  return (
    <div className={styles.transactionSkeleton}>
      <div>
        <Skeleton className={styles.tokenIcon} />
      </div>

      <div className={styles.tokenNameContainer}>
        <Skeleton className={styles.address} />
        <Skeleton className={styles.tokenSymbol} />
      </div>

      <div className={styles.tokenPriceContainer}>
        <Skeleton className={styles.amount} />
        <Skeleton className={styles.change} />
      </div>
    </div>
  );
};
