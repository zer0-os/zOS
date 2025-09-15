import React from 'react';

import styles from './styles.module.scss';

export const NetworkSelector = () => {
  const networks = [
    { id: 'zchain', name: 'Z Chain' },
  ];

  return (
    <div className={styles.NetworkSelector}>
      <div className={styles.NetworkSection}>
        <div className={styles.NetworkButtons}>
          {networks.map((network) => (
            <div key={network.id} className={`${styles.NetworkButton} ${styles.Active}`}>
              <div className={styles.NetworkIcon}>
                <span className={styles.IconText}>Z</span>
              </div>
              {network.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
