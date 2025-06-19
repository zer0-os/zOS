import React from 'react';

import styles from './styles.module.scss';

export const Loading: React.FC = () => {
  return (
    <>
      <div className={styles.SectionContainer}>
        <div className={styles.SectionHeaderRow}>
          <div className={styles.SectionLine} />
          <div className={styles.SectionHeader}>Activate Zero Pro</div>
          <div className={styles.SectionLine} />
        </div>

        <div className={styles.LoadingContainer}>
          <div className={styles.Spinner} />
          <div className={styles.LoadingText}>Activating your subscription...</div>
        </div>
      </div>
    </>
  );
};
