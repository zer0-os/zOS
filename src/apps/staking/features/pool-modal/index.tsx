import { useState } from 'react';
import { Modal } from '@zero-tech/zui/components';
import { ViewPool } from '../view-pool';
import { StakeInPool } from '../stake-in-pool';

import styles from './styles.module.scss';
import { UnstakeFromPool } from '../unstake-from-pool';

export interface PoolModalProps {
  poolName: string;
  poolAddress?: string;
  chainId?: number;
  poolIconImageUrl?: string;
  onOpenChange: (open: boolean) => void;
}

export const PoolModal = ({ poolName, poolAddress, chainId, poolIconImageUrl, onOpenChange }: PoolModalProps) => {
  const [mode, setMode] = useState<'view' | 'stake' | 'unstake'>('view');

  const handleClose = () => {
    setMode('view'); // Reset to view mode when closing
    onOpenChange(false);
  };

  const handleStake = () => {
    setMode('stake');
  };

  const handleUnstake = () => {
    setMode('unstake');
  };

  const renderContent = () => {
    if (mode === 'unstake') {
      return (
        <UnstakeFromPool
          poolAddress={poolAddress!}
          poolName={poolName}
          chainId={chainId!}
          poolIconImageUrl={poolIconImageUrl!}
          onClose={handleClose}
        />
      );
    }

    if (mode === 'view') {
      return (
        <ViewPool
          poolName={poolName}
          poolAddress={poolAddress!}
          chainId={chainId!}
          poolIconImageUrl={poolIconImageUrl}
          onStake={handleStake}
          onUnstake={handleUnstake}
        />
      );
    }

    return (
      <StakeInPool
        poolAddress={poolAddress!}
        poolName={poolName}
        chainId={chainId}
        poolIconImageUrl={poolIconImageUrl}
        onClose={handleClose}
      />
    );
  };

  return (
    <Modal open={!!poolAddress} defaultOpen={false} onOpenChange={handleClose} className={styles.Modal}>
      {renderContent()}
    </Modal>
  );
};
