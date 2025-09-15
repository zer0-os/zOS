import React from 'react';

import styles from './styles.module.scss';

export const EmptyState = () => {
  return (
    <tr className={styles.EmptyRow}>
      <td colSpan={6} className={styles.EmptyState}>
        <div>No tokens found</div>
        <div className={styles.EmptySubtext}>Select a network to view tokens</div>
      </td>
    </tr>
  );
};
