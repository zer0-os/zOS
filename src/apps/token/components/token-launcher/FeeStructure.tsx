import React from 'react';
import styles from './styles.module.scss';

export const FeeStructure = () => {
  return (
    <div className={styles.FeeStructure}>
      <div className={styles.FeeSection}>
        <div className={styles.FeeTitle}>Entry Fees (Buy)</div>
        <div className={styles.FeeItem}>
          <span>Vault Fee:</span>
          <span>1%</span>
        </div>
        <div className={styles.FeeItem}>
          <span>Protocol Fee:</span>
          <span>1%</span>
        </div>
      </div>

      <div className={styles.FeeSection}>
        <div className={styles.FeeTitle}>Exit Fees (Sell)</div>
        <div className={styles.FeeItem}>
          <span>Vault Fee:</span>
          <span>1%</span>
        </div>
        <div className={styles.FeeItem}>
          <span>Protocol Fee:</span>
          <span>1%</span>
        </div>
      </div>
    </div>
  );
};
