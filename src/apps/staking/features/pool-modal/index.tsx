import { useState } from 'react';
import { Modal } from '@zero-tech/zui/components';
import { ViewPool } from '../view-pool';
import { StakeInPool } from '../stake-in-pool';

import styles from './styles.module.scss';

export interface PoolModalProps {
  poolName: string;
  poolAddress?: string;
  chainId?: number;
  onOpenChange: (open: boolean) => void;
}

export const PoolModal = ({ poolName, poolAddress, chainId, onOpenChange }: PoolModalProps) => {
  const [mode, setMode] = useState<'view' | 'stake'>('view');

  const handleClose = () => {
    setMode('view'); // Reset to view mode when closing
    onOpenChange(false);
  };

  const handleStake = () => {
    setMode('stake');
  };

  return (
    <Modal open={!!poolAddress} defaultOpen={false} onOpenChange={handleClose} className={styles.Modal}>
      {mode === 'view' ? (
        <ViewPool poolName={poolName} poolAddress={poolAddress!} chainId={chainId!} onStake={handleStake} />
      ) : (
        <StakeInPool poolAddress={poolAddress!} poolName={poolName} chainId={chainId} onClose={handleClose} />
      )}
    </Modal>
  );
};
