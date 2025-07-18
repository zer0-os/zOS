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

  const totalUSD = formatUSD(calculateTotalPriceInUSDCents(rewards.meow, rewards.meowInUSD ?? 0));
  const totalMeow = `${formatWeiAmount(rewards.meow)} MEOW`;

  return (
    <div className={styles.RewardsItem}>
      <div className={styles.Header}>
        <div className={styles.Title}>Earnings</div>
        <IconChevronRight size={18} isFilled />
      </div>

      <div className={styles.InfoContainer}>
        <div className={styles.Usd}>{totalUSD}</div>

        <div className={styles.ClaimButtonContainer}>
          <ClaimRewardsButton rewardsTotal={totalMeow} rewardsTotalInUSD={totalUSD} className={styles.ClaimButton} />
        </div>
      </div>
    </div>
  );
};
