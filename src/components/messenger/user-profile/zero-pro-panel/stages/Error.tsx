import React from 'react';

import styles from './styles.module.scss';

interface Props {
  error: string;
}

export const Error: React.FC<Props> = ({ error }) => {
  return (
    <>
      <div className={styles.SectionContainer}>
        <div className={styles.SectionHeaderRow}>
          <div className={styles.SectionLine} />
          <div className={styles.SectionHeader}>Status</div>
          <div className={styles.SectionLine} />
        </div>

        <div className={styles.ErrorContainer}>
          <div className={styles.ErrorText}>{error}</div>
        </div>
      </div>
    </>
  );
};
