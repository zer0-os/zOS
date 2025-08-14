import { TokenIcon } from '../../../wallet/components/token-icon/token-icon';
import styles from './styles.module.scss';

export const PoolIcon = ({ poolName, chainId, imageUrl }: { poolName: string; chainId: number; imageUrl?: string }) => {
  return (
    <div className={styles.Details}>
      <TokenIcon url={imageUrl || ''} name={poolName || 'Staking Pool'} chainId={chainId} />
      <span>{poolName || 'Staking Pool'}</span>
    </div>
  );
};
