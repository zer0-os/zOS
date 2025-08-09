import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';

import { Table, TableData, Body, Skeleton, HeaderGroup, TableHeader } from '@zero-tech/zui/components';
import { PoolModal } from '../pool-modal';
import { PoolIcon } from '../../components/PoolIcon';
import { meowInUSDSelector } from '../../../../store/rewards/selectors';

import { usePoolStats } from '../../lib/usePoolStats';
import { useUserStakingInfo } from '../../lib/useUserStakingInfo';
import millify from 'millify';

import classNames from 'classnames';
import styles from './styles.module.scss';

const POOL_CONFIGS = [
  process.env.NODE_ENV === 'development'
    ? {
        name: 'MEOW Pool (Zephyr)',
        address: '0xa5086d0575E8573d7f56B485079126EdD65c8291',
        chainId: 1417429182,
        poolIconImageUrl: '/tokens/meow.png',
      }
    : {
        name: 'MEOW Pool',
        address: '0xfbDC0647F0652dB9eC56c7f09B7dD3192324AD6a',
        chainId: 9369,
        poolIconImageUrl: '/tokens/meow.png',
      },
];

const PoolRowWithData = ({
  poolConfig,
  onPoolSelect,
}: {
  poolConfig: typeof POOL_CONFIGS[0];
  onPoolSelect: (address: string) => void;
}) => {
  const meowPrice = useSelector(meowInUSDSelector);

  const {
    totalStaked,
    // apyRange,
    loading: statsLoading,
    error: statsError,
  } = usePoolStats(poolConfig.address);

  const { userStakingInfo, loading: userLoading, error: userError } = useUserStakingInfo(poolConfig.address);

  const loading = statsLoading || userLoading;
  const error = statsError || userError;

  const totalStakedFormatted = totalStaked ? parseFloat(ethers.utils.formatUnits(totalStaked, 18)) : 0;
  const userStakedFormatted = userStakingInfo?.amountStaked
    ? parseFloat(ethers.utils.formatUnits(userStakingInfo.amountStaked, 18))
    : 0;

  return (
    <tr key={poolConfig.address} className={styles.PoolRow} onClick={() => onPoolSelect(poolConfig.address)}>
      <TableData alignment='left' className={styles.Details}>
        <PoolIcon poolName={poolConfig.name} chainId={poolConfig.chainId} imageUrl={poolConfig.poolIconImageUrl} />
      </TableData>
      {/* <TableData alignment='right' className={styles.APY}>
        {loading ? (
          <Skeleton width='60px' />
        ) : error ? (
          'Error'
        ) : apyRange ? (
          `${apyRange.min.toFixed(1)}% - ${apyRange.max.toFixed(1)}%`
        ) : (
          '-%'
        )}
      </TableData> */}
      <TableData alignment='right' className={classNames(styles.Stake, totalStakedFormatted > 0 && styles.IsStaked)}>
        {loading ? (
          <Skeleton width='30px' />
        ) : error ? (
          'Error'
        ) : (
          `$${millify(totalStakedFormatted * meowPrice, { precision: 2 })}`
        )}
      </TableData>
      <TableData alignment='right' className={classNames(styles.Stake, userStakedFormatted > 0 && styles.IsStaked)}>
        {loading ? (
          <Skeleton width='30px' />
        ) : error ? (
          'Error'
        ) : (
          `$${millify(userStakedFormatted * meowPrice, { precision: 2 })}`
        )}
      </TableData>
    </tr>
  );
};

export const StakingPoolTable = () => {
  const [selectedPool, setSelectedPool] = useState<{
    address: string;
    chainId: number;
    name: string;
    poolIconImageUrl?: string;
  } | null>(null);

  return (
    <>
      <PoolModal
        poolName={selectedPool?.name || ''}
        poolAddress={selectedPool?.address || undefined}
        chainId={selectedPool?.chainId}
        poolIconImageUrl={selectedPool?.poolIconImageUrl}
        onOpenChange={() => setSelectedPool(null)}
      />
      <Table>
        <HeaderGroup>
          <TableHeader alignment='left'>Pool Name</TableHeader>
          {/* <TableHeader alignment='right'>APY</TableHeader> */}
          <TableHeader alignment='right'>TVL</TableHeader>
          <TableHeader alignment='right'>Your Stake</TableHeader>
        </HeaderGroup>
        <Body>
          {POOL_CONFIGS.map((poolConfig) => (
            <PoolRowWithData
              key={poolConfig.address}
              poolConfig={poolConfig}
              onPoolSelect={(address) =>
                setSelectedPool({
                  address,
                  chainId: poolConfig.chainId,
                  name: poolConfig.name,
                  poolIconImageUrl: poolConfig.poolIconImageUrl,
                })
              }
            />
          ))}
        </Body>
      </Table>
    </>
  );
};
