import { Button } from '@zero-tech/zui/components/Button';
import { Skeleton } from '@zero-tech/zui/components';
import { usePoolStats } from '../../lib/usePoolStats';
import { usePool } from '../../lib/usePool';
import { ethers } from 'ethers';
import millify from 'millify';

import blur from './assets/blur.svg';

import styles from './styles.module.scss';
import { PoolIcon } from '../../components/PoolIcon';

interface ViewPoolProps {
  poolName: string;
  poolAddress: string;
  chainId: number;
  onStake: () => void;
}

export const ViewPool = ({ poolName, poolAddress, chainId, onStake }: ViewPoolProps) => {
  const {
    // apyRange,
    loading: statsLoading,
    error: statsError,
  } = usePoolStats(poolAddress, chainId);
  const {
    stakingTokenInfo,
    rewardsTokenInfo,
    userPendingRewards,
    userStakedAmount,
    // userStakedAmountLocked,
    // userUnlockedTimestamp,
    totalStaked,
    loading: poolLoading,
    error: poolError,
  } = usePool(poolAddress, chainId);

  const loading = statsLoading || poolLoading;
  const error = statsError || poolError;

  const unlockedBalanceFormatted = userStakedAmount
    ? parseFloat(ethers.utils.formatUnits(userStakedAmount || 0, 18))
    : 0;
  // const lockedBalanceFormatted = userStakedAmountLocked
  //   ? parseFloat(ethers.utils.formatUnits(userStakedAmountLocked || 0, 18))
  //   : 0;
  const pendingRewardsFormatted = userPendingRewards ? parseFloat(ethers.utils.formatUnits(userPendingRewards, 18)) : 0;
  const totalStakedFormatted = totalStaked ? parseFloat(ethers.utils.formatUnits(totalStaked, 18)) : 0;

  // const getUnlockDate = () => {
  //   if (!userUnlockedTimestamp) return null;
  //   const timestamp = Number(userUnlockedTimestamp) * 1000; // Convert to milliseconds
  //   const date = new Date(timestamp);
  //   const now = new Date();

  //   if (date <= now) {
  //     return 'Unlocked';
  //   }

  //   return date.toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //   });
  // };

  return (
    <div className={styles.Container}>
      <PoolIcon poolName={poolName} chainId={chainId} />

      <p>
        Stake your {stakingTokenInfo?.symbol} to earn {rewardsTokenInfo?.symbol} rewards.
      </p>

      <div className={styles.Card}>
        <h3>Rewards {rewardsTokenInfo?.symbol}</h3>
        <span>
          {loading ? (
            <Skeleton width='150px' />
          ) : error ? (
            'Error'
          ) : userPendingRewards === null || userPendingRewards === undefined ? (
            '0'
          ) : (
            millify(pendingRewardsFormatted, { precision: 2 })
          )}
        </span>
        <img src={blur} alt='blur' />
      </div>

      <div className={styles.BalanceCards}>
        <div className={styles.Card}>
          <h3>Total Tokens Staked {stakingTokenInfo?.symbol}</h3>
          <span>
            {loading ? <Skeleton width='100px' /> : error ? 'Error' : millify(totalStakedFormatted, { precision: 2 })}
          </span>
        </div>

        <div className={styles.Card}>
          <h3>Your Stake {stakingTokenInfo?.symbol}</h3>
          <span>
            {loading ? (
              <Skeleton width='100px' />
            ) : error ? (
              'Error'
            ) : (
              millify(unlockedBalanceFormatted, { precision: 2 })
            )}
          </span>
        </div>
      </div>

      {/* <ul className={styles.Details}>
        <li>
          <span className={styles.Label}>APY Range:</span>
          <span className={styles.Value}>
            {loading ? (
              <Skeleton width='100px' />
            ) : error ? (
              'Error'
            ) : apyRange ? (
              `${apyRange.min.toFixed(1)}% - ${apyRange.max.toFixed(1)}%`
            ) : (
              '-%'
            )}
          </span>
        </li>
      </ul> */}

      <div className={styles.Actions}>
        <Button onPress={onStake}>Stake in Pool</Button>
      </div>
    </div>
  );
};
