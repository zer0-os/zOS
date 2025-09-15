import React from 'react';
import { IconChevronUp, IconChevronDown } from '@zero-tech/zui/icons';
import { SortConfig, SortKey } from '../utils';

import styles from './styles.module.scss';

interface TableHeaderProps {
  sortConfig: SortConfig;
  onSort: (key: SortKey) => void;
}

export const TableHeader = ({ sortConfig, onSort }: TableHeaderProps) => {
  const renderSortIcon = (key: SortKey) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'desc' ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />;
    }
    return null;
  };

  return (
    <thead>
      <tr>
        <th
          className={`${styles.RankColumn} ${sortConfig.key === 'rank' ? styles.ActiveSort : ''}`}
          onClick={() => onSort('rank')}
          role='button'
          tabIndex={0}
        >
          <div className={styles.HeaderContent}>
            <span>#</span>
            {renderSortIcon('rank')}
          </div>
        </th>
        <th
          className={`${styles.NameColumn} ${sortConfig.key === 'name' ? styles.ActiveSort : ''}`}
          onClick={() => onSort('name')}
          role='button'
          tabIndex={0}
        >
          <div className={styles.HeaderContent}>
            <span>Name</span>
            {renderSortIcon('name')}
          </div>
        </th>
        <th
          className={`${styles.PriceColumn} ${sortConfig.key === 'price' ? styles.ActiveSort : ''}`}
          onClick={() => onSort('price')}
          role='button'
          tabIndex={0}
        >
          <div className={styles.HeaderContent}>
            <span>Price</span>
            {renderSortIcon('price')}
          </div>
        </th>
        <th
          className={`${styles.ChangeColumn} ${sortConfig.key === 'change24h' ? styles.ActiveSort : ''}`}
          onClick={() => onSort('change24h')}
          role='button'
          tabIndex={0}
        >
          <div className={styles.HeaderContent}>
            <span>24h %</span>
            {renderSortIcon('change24h')}
          </div>
        </th>
        <th
          className={`${styles.MarketCapColumn} ${sortConfig.key === 'marketCap' ? styles.ActiveSort : ''}`}
          onClick={() => onSort('marketCap')}
          role='button'
          tabIndex={0}
        >
          <div className={styles.HeaderContent}>
            <span>Market Cap</span>
            {renderSortIcon('marketCap')}
          </div>
        </th>
        <th className={styles.TradeColumn}>
          <div className={styles.HeaderContent}>
            <span>Trade</span>
          </div>
        </th>
      </tr>
    </thead>
  );
};
