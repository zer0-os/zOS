import { TokenIcon } from '../../../wallet/components/token-icon/token-icon';
import styles from './styles.module.scss';

export const PoolIcon = ({ poolName, chainId }: { poolName: string; chainId: number }) => {
  return (
    <div className={styles.Details}>
      <TokenIcon url={''} name={poolName || 'Staking Pool'} chainId={chainId} />
      <span>{poolName || 'Staking Pool'}</span>
    </div>
  );
};
