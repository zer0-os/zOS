import { Button } from '@zero-tech/zui/components/Button';
import { Skeleton } from '@zero-tech/zui/components';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { PoolIcon } from '../../components/PoolIcon';
import { IconCoinsStacked1 } from '@zero-tech/zui/icons';

import { usePoolStats } from '../../lib/usePoolStats';
import { usePool } from '../../lib/usePool';
import { useClaimRewards } from '../../lib/useClaimRewards';

import { ethers } from 'ethers';
import millify from 'millify';

import blur from './assets/blur.svg';

import styles from './styles.module.scss';
import classNames from 'classnames';

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

  const { mutate: claimRewards, isPending: isClaimingRewards } = useClaimRewards(poolAddress);

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

  const handleOnClickClaimRewards = () => {
    claimRewards();
  };

  return (
    <div className={styles.Container}>
      <PoolIcon poolName={poolName} chainId={chainId} />

      <p>
        Stake your {stakingTokenInfo?.symbol} to earn {rewardsTokenInfo?.symbol} rewards.
      </p>

      <button
        disabled={isClaimingRewards}
        aria-disabled={isClaimingRewards}
        className={classNames(styles.Card, styles.Rewards, { [styles.IsClaiming]: isClaimingRewards })}
        onClick={handleOnClickClaimRewards}
      >
        {isClaimingRewards && (
          <div className={styles.Claiming}>
            <Spinner />
          </div>
        )}
        <div className={styles.Header}>
          <h3>Rewards {rewardsTokenInfo?.symbol}</h3>
          <div>
            <IconCoinsStacked1 size={16} />
            Claim Rewards
          </div>
        </div>
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
      </button>

      <div className={styles.BalanceCards}>
        <div className={styles.Card}>
          <h3>Total Tokens Staked {stakingTokenInfo?.symbol}</h3>
          <span>
            {loading ? <Skeleton width='100px' /> : error ? 'Error' : millify(totalStakedFormatted, { precision: 2 })}
          </span>
        </div>

        <div className={styles.Card}>
          <h3>Your Staked {stakingTokenInfo?.symbol}</h3>
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
        <Button onPress={onStake} isDisabled={isClaimingRewards}>
          Stake in Pool
        </Button>
      </div>
    </div>
  );
};
