import styles from './token-skeleton.module.scss';
import { Skeleton } from '@zero-tech/zui/components';

export const TokenSkeleton = () => {
  return (
    <div className={styles.tokenSkeleton}>
      <div>
        <Skeleton className={styles.tokenIcon} />
      </div>

      <div className={styles.tokenNameContainer}>
        <Skeleton className={styles.tokenName} />
        <Skeleton className={styles.tokenAmount} />
      </div>

      <div className={styles.tokenPriceContainer}>
        <Skeleton className={styles.tokenPrice} />
        <Skeleton className={styles.tokenChange} />
      </div>
    </div>
  );
};
