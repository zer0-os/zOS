import React from 'react';

import { IconChevronRight } from '@zero-tech/zui/icons';
import { calculateTotalPriceInUSDCents, formatUSD, formatWeiAmount } from '../../../../../lib/number';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/reducer';
import { ClaimRewardsButton } from '../../../../claim-rewards-button';

import styles from './styles.module.scss';

export interface Properties {}

const selectRewards = (state: RootState) => state.rewards;

export const RewardsItem: React.FC<Properties> = () => {
  const rewards = useSelector(selectRewards);

  const totalRewards =
    BigInt(rewards.totalDailyRewards) + BigInt(rewards.totalReferralFees) + BigInt(rewards.legacyRewards);
  const totalUSD = formatUSD(calculateTotalPriceInUSDCents(totalRewards.toString(), rewards.meowInUSD ?? 0));
  const claimableRewardsUSD = formatUSD(
    calculateTotalPriceInUSDCents(rewards.unclaimedRewards.toString(), rewards.meowInUSD ?? 0)
  );
  const claimableMeow = `${formatWeiAmount(rewards.unclaimedRewards.toString())} MEOW`;

  return (
    <div className={styles.RewardsItem}>
      <div className={styles.Header}>
        <div className={styles.Title}>Earnings</div>
        <IconChevronRight size={18} isFilled />
      </div>

      <div className={styles.InfoContainer}>
        <div className={styles.RewardsTotalContainer}>
          <div className={styles.Usd}>{totalUSD}</div>
          {BigInt(rewards.unclaimedRewards) > 0n && (
            <div className={styles.ClaimableRewards}>
              You can now claim {claimableRewardsUSD} or {claimableMeow}
            </div>
          )}
        </div>

        <div className={styles.ClaimButtonContainer}>
          <ClaimRewardsButton
            rewardsTotal={claimableMeow}
            rewardsTotalInUSD={claimableRewardsUSD}
            className={styles.ClaimButton}
          />
        </div>
      </div>
    </div>
  );
};
