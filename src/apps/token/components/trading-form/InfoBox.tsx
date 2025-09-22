import React from 'react';
import styles from './styles.module.scss';

export const InfoBox = () => {
  return (
    <div className={styles.InfoBox}>
      <div className={styles.InfoTitle}>Fees</div>
      <div className={styles.FeeItem}>
        <span className={styles.FeeLabel}>Vault Entry Fee:</span>
        <span className={styles.FeeValue}>1%</span>
      </div>
      <div className={styles.FeeItem}>
        <span className={styles.FeeLabel}>Protocol Entry Fee:</span>
        <span className={styles.FeeValue}>1%</span>
      </div>
    </div>
  );
};
