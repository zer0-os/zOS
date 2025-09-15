import React from 'react';
import { TokenData, formatPrice, formatTotalSupply, formatChange } from '../utils';

import styles from './styles.module.scss';

interface TableRowProps {
  token: TokenData;
  onTokenClick?: (tokenAddress: string) => void;
}

export const TableRow = ({ token, onTokenClick }: TableRowProps) => {
  const handleClick = () => {
    if (onTokenClick) {
      onTokenClick(token.address);
    }
  };

  return (
    <tr className={styles.TokenRow} onClick={handleClick}>
      <td className={styles.TokenColumn}>
        <div className={styles.TokenInfo}>
          <div className={styles.TokenRank}>#{token.rank}</div>
          <div className={styles.TokenIcon}>
            <div className={styles.TokenIconPlaceholder} />
          </div>
          <div className={styles.TokenDetails}>
            <div className={styles.TokenName}>
              {token.pair} - {token.name}
            </div>
            {token.description && <div className={styles.TokenDescription}>{token.description}</div>}
          </div>
        </div>
      </td>
      <td className={styles.PriceColumn}>
        <div className={styles.Price}>{formatPrice(token.price)}</div>
      </td>

      <td className={styles.ChangeColumn}>
        <div className={`${styles.Change} ${token.change24h >= 0 ? styles.Positive : styles.Negative}`}>
          {formatChange(token.change24h)}
        </div>
      </td>
      <td className={styles.TotalSupplyColumn}>
        <div className={styles.TotalSupply}>{formatTotalSupply(token.totalSupply)}</div>
      </td>
      <td className={styles.StatusColumn}>
        <div className={`${styles.Status} ${styles[token.status]}`}>{token.status}</div>
      </td>
    </tr>
  );
};
