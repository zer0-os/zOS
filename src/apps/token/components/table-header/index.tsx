import React from 'react';
import {
  IconCoinsStacked1,
  IconCurrencyDollarCircle,
  IconDatabase1,
  IconActivity,
  IconChevronUp,
  IconChevronDown,
  IconFlag01,
} from '@zero-tech/zui/icons';
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
          className={`${styles.TokenColumn} ${sortConfig.key === 'rank' ? styles.ActiveSort : ''}`}
          onClick={() => onSort('rank')}
          role='button'
          tabIndex={0}
        >
          <div className={styles.HeaderContent}>
            <div className={styles.HeaderLeft}>
              <span>Token</span>
              <IconCoinsStacked1 size={16} />
            </div>
            {renderSortIcon('rank')}
          </div>
        </th>
        <th
          className={`${styles.PriceColumn} ${sortConfig.key === 'price' ? styles.ActiveSort : ''}`}
          onClick={() => onSort('price')}
          role='button'
          tabIndex={0}
        >
          <div className={styles.HeaderContent}>
            <div className={styles.HeaderLeft}>
              <span>Price</span>
              <IconCurrencyDollarCircle size={16} />
            </div>
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
            <div className={styles.HeaderLeft}>
              <span>24hr</span>
              <IconActivity size={16} />
            </div>
            {renderSortIcon('change24h')}
          </div>
        </th>
        <th
          className={`${styles.TotalSupplyColumn} ${sortConfig.key === 'totalSupply' ? styles.ActiveSort : ''}`}
          onClick={() => onSort('totalSupply')}
          role='button'
          tabIndex={0}
        >
          <div className={styles.HeaderContent}>
            <div className={styles.HeaderLeft}>
              <span>Total Supply</span>
              <IconDatabase1 size={14} />
            </div>
            {renderSortIcon('totalSupply')}
          </div>
        </th>
        <th
          className={`${styles.StatusColumn} ${sortConfig.key === 'status' ? styles.ActiveSort : ''}`}
          onClick={() => onSort('status')}
          role='button'
          tabIndex={0}
        >
          <div className={styles.HeaderContent}>
            <div className={styles.HeaderLeft}>
              <span>Status</span>
              <IconFlag01 size={16} />
            </div>
            {renderSortIcon('status')}
          </div>
        </th>
      </tr>
    </thead>
  );
};
