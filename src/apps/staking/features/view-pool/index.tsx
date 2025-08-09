import { useSelector } from 'react-redux';

import { Button } from '@zero-tech/zui/components/Button';
import { Skeleton } from '@zero-tech/zui/components';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { PoolIcon } from '../../components/PoolIcon';
import { IconCoinsStacked1 } from '@zero-tech/zui/icons';

import { usePoolStats } from '../../lib/usePoolStats';
import { usePool } from '../../lib/usePool';
import { useClaimRewards } from '../../lib/useClaimRewards';
import { meowInUSDSelector } from '../../../../store/rewards/selectors';
import { featureFlags } from '../../../../lib/feature-flags';

import { ethers } from 'ethers';
import millify from 'millify';

import blur from './assets/blur.svg';

import styles from './styles.module.scss';
import classNames from 'classnames';

interface ViewPoolProps {
  poolName: string;
  poolAddress: string;
  chainId: number;
  poolIconImageUrl?: string;
  onStake: () => void;
  onUnstake: () => void;
}

export const ViewPool = ({ poolName, poolAddress, chainId, poolIconImageUrl, onStake, onUnstake }: ViewPoolProps) => {
  const meowPrice = useSelector(meowInUSDSelector);

  const {
    // apyRange,
    loading: statsLoading,
    error: statsError,
  } = usePoolStats(poolAddress);
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
  } = usePool(poolAddress);

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

  const hasClaimableRewards = userPendingRewards && pendingRewardsFormatted > 0.01;

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

  const renderRewardsAmount = () => {
    if (loading) {
      return <Skeleton width='150px' />;
    }

    if (error || userPendingRewards === null || userPendingRewards === undefined) {
      return 'Error';
    }

    return millify(pendingRewardsFormatted, { precision: 2 });
  };

  return (
    <div className={styles.Container}>
      <PoolIcon poolName={poolName} chainId={chainId} imageUrl={poolIconImageUrl} />

      <p>
        Stake your {stakingTokenInfo?.symbol} to earn {rewardsTokenInfo?.symbol} rewards.
      </p>

      <button
        disabled={isClaimingRewards || !hasClaimableRewards}
        aria-disabled={isClaimingRewards || !hasClaimableRewards}
        className={classNames(styles.Card, styles.Rewards)}
        onClick={handleOnClickClaimRewards}
      >
        {isClaimingRewards && (
          <div className={styles.Claiming}>
            <Spinner />
          </div>
        )}
        <div className={styles.Header}>
          <h3>Claimable Rewards {rewardsTokenInfo?.symbol}</h3>
          <div className={styles.ClaimRewards}>
            <IconCoinsStacked1 size={16} />
            Claim Rewards
          </div>
        </div>
        <span>{renderRewardsAmount()}</span>
        <img src={blur} alt='blur' />
      </button>

      <div className={styles.BalanceCards}>
        <div className={styles.Card}>
          <h3>TVL</h3>
          <span>
            {loading ? (
              <Skeleton width='100px' />
            ) : error ? (
              'Error'
            ) : (
              `$${millify(totalStakedFormatted * meowPrice, { precision: 2 })}`
            )}
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
        {featureFlags.enableUnstaking && (
          <Button
            onPress={onUnstake}
            isDisabled={isClaimingRewards || !userStakedAmount || unlockedBalanceFormatted === 0}
          >
            Unstake
          </Button>
        )}
        <Button onPress={onStake} isDisabled={isClaimingRewards}>
          Stake in Pool
        </Button>
      </div>
    </div>
  );
};
