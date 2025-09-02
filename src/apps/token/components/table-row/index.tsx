import React from 'react';
import { TokenData, formatPrice, formatVolume, formatChange } from '../utils';

import styles from './styles.module.scss';

interface TableRowProps {
  token: TokenData;
}

export const TableRow = ({ token }: TableRowProps) => {
  return (
    <tr className={styles.TokenRow}>
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
      <td className={styles.VolumeColumn}>
        <div className={styles.Volume}>{formatVolume(token.volume)}</div>
      </td>
      <td className={styles.ChangeColumn}>
        <div className={`${styles.Change} ${token.change24h >= 0 ? styles.Positive : styles.Negative}`}>
          {formatChange(token.change24h)}
        </div>
      </td>
    </tr>
  );
};
