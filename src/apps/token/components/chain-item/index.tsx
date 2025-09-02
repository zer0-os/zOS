import React from 'react';
import { useHistory } from 'react-router-dom';

import { IconCoinsStacked2 } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

interface ChainItemProps {
  route: string;
  chainId: string;
  chainName: string;
  chainIcon: string;
  isSelected?: boolean;
}

export const ChainItem = ({
  route,
  chainId: _chainId,
  chainName,
  chainIcon: _chainIcon,
  isSelected,
}: ChainItemProps) => {
  const history = useHistory();

  const handleOnClick = () => {
    history.push(route);
  };

  return (
    <li
      className={`${styles.ChainItem} ${isSelected ? styles.ChainItemActive : ''}`}
      tabIndex={0}
      onClick={handleOnClick}
    >
      <div className={styles.Content}>
        <div className={styles.Header}>
          <div className={styles.IconContainer}>
            <div className={styles.ChainIcon}>
              <IconCoinsStacked2 size={20} />
            </div>
          </div>
          <div className={styles.NameContainer}>
            <div className={styles.ChainName}>
              <div>{chainName}</div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
