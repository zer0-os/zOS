import React, { useState, useMemo } from 'react';
import { TokenData, SortConfig, handleSort, sortTokens } from '../utils';
import { TableHeader } from '../table-header';
import { TableRow } from '../table-row';
import { EmptyState } from '../table-empty-state';

import styles from './styles.module.scss';

interface DexTableProps {
  tokens?: TokenData[];
  onTokenClick?: (tokenAddress: string) => void;
}

export const DexTable = ({ tokens, onTokenClick }: DexTableProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  const handleSortClick = (key: string) => {
    setSortConfig((prevConfig) => handleSort(prevConfig, key as any));
  };

  const sortedTokens = useMemo(() => {
    return sortTokens(tokens || [], sortConfig);
  }, [tokens, sortConfig]);

  const renderTokenRows = () => {
    if (!sortedTokens || sortedTokens.length === 0) {
      return <EmptyState />;
    }

    return sortedTokens.map((token) => <TableRow key={token.id} token={token} onTokenClick={onTokenClick} />);
  };

  return (
    <div className={styles.DexTableContainer}>
      <table className={styles.DexTable}>
        <TableHeader sortConfig={sortConfig} onSort={handleSortClick} />
        <tbody>{renderTokenRows()}</tbody>
      </table>
    </div>
  );
};
