import React from 'react';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { TokenData, formatPrice, formatMarketCap, formatChange } from '../utils';

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
      <td className={styles.RankColumn}>
        <div className={styles.Rank}>#{token.rank}</div>
      </td>
      <td className={styles.NameColumn}>
        <div className={styles.TokenInfo}>
          <div className={styles.TokenIcon}>
            <div className={styles.TokenIconPlaceholder} />
          </div>
          <div className={styles.TokenDetails}>
            <div className={styles.TokenName}>{token.name}</div>
            <div className={styles.TokenSymbol}>{token.symbol}</div>
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
      <td className={styles.MarketCapColumn}>
        <div className={styles.MarketCap}>{formatMarketCap(token.marketCap)}</div>
      </td>
      <td className={styles.TradeColumn}>
        <Button
          variant={ButtonVariant.Primary}
          onPress={() => {
            // TODO: Implement trade functionality
          }}
          className={styles.TradeButton}
        >
          Trade
        </Button>
      </td>
    </tr>
  );
};
