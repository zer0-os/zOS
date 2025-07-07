import React from 'react';

import styles from './styles.module.scss';

interface Props {
  isZeroProSubscriber: boolean;
}

export const Loading: React.FC<Props> = ({ isZeroProSubscriber }) => {
  return (
    <>
      <div className={styles.SectionContainer}>
        <div className={styles.SectionHeaderRow}>
          <div className={styles.SectionLine} />
          <div className={styles.SectionHeader}>{isZeroProSubscriber ? 'Cancel Zero Pro' : 'Activate Zero Pro'}</div>
          <div className={styles.SectionLine} />
        </div>

        <div className={styles.LoadingContainer}>
          <div className={styles.Spinner} />
          <div className={styles.LoadingText}>
            {isZeroProSubscriber ? 'Cancelling your subscription...' : 'Activating your subscription...'}
          </div>
        </div>
      </div>
    </>
  );
};
