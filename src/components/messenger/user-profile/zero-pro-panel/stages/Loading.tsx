import React from 'react';

import styles from './styles.module.scss';

interface Props {
  title?: string;
  message?: string;
}

export const Loading: React.FC<Props> = ({
  title = 'Activate Zero Pro',
  message = 'Activating your subscription...',
}) => {
  return (
    <>
      <div className={styles.SectionContainer}>
        <div className={styles.SectionHeaderRow}>
          <div className={styles.SectionLine} />
          <div className={styles.SectionHeader}>{title}</div>
          <div className={styles.SectionLine} />
        </div>

        <div className={styles.LoadingContainer}>
          <div className={styles.Spinner} />
          <div className={styles.LoadingText}>{message}</div>
        </div>
      </div>
    </>
  );
};
