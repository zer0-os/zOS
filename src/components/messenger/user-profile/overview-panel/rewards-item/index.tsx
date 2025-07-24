import React from 'react';

import { IconChevronRight, IconInfoCircle } from '@zero-tech/zui/icons';
import { calculateTotalPriceInUSDCents, formatUSD, formatWeiAmount } from '../../../../../lib/number';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/reducer';
import { ClaimRewardsButton } from '../../../../claim-rewards-button';
import { HoverCard } from '../../../../hover-card';
import { Button, Variant as ButtonVariant, Size } from '@zero-tech/zui/components';
import { openZeroPro } from '../../../../../store/user-profile';

import styles from './styles.module.scss';

export interface Properties {}

const selectRewards = (state: RootState) => state.rewards;
const selectIsZeroProSubscriber = (state: RootState) => state.authentication.user.data.subscriptions.zeroPro;

export const RewardsItem: React.FC<Properties> = () => {
  const rewards = useSelector(selectRewards);
  const isZeroProSubscriber = useSelector(selectIsZeroProSubscriber);
  const dispatch = useDispatch();

  const totalRewards =
    BigInt(rewards.totalDailyRewards) + BigInt(rewards.totalReferralFees) + BigInt(rewards.legacyRewards);
  const totalUSD = formatUSD(calculateTotalPriceInUSDCents(totalRewards.toString(), rewards.meowInUSD ?? 0));
  const claimableRewardsUSD = formatUSD(
    calculateTotalPriceInUSDCents(rewards.unclaimedRewards.toString(), rewards.meowInUSD ?? 0)
  );
  const claimableMeow = `${formatWeiAmount(rewards.unclaimedRewards.toString())} MEOW`;

  const handleJoinZeroPro = () => {
    dispatch(openZeroPro());
  };

  const renderHoverCardContent = () => {
    if (BigInt(rewards.unclaimedRewards) > 0n) {
      return (
        <div>
          You can now claim {claimableRewardsUSD} or {claimableMeow}
        </div>
      );
    }

    return (
      <div className={styles.HoverCardText}>
        <div>No earnings available to claim</div>
        {!isZeroProSubscriber && (
          <>
            <Button
              variant={ButtonVariant.Secondary}
              onPress={handleJoinZeroPro}
              size={Size.Small}
              className={styles.HoverCardTextButton}
            >
              Join ZERO Pro
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={styles.RewardsItem}>
      <div className={styles.Header}>
        <div className={styles.Title}>Earnings</div>
        <IconChevronRight size={18} isFilled />
      </div>
      <div className={styles.InfoContainer}>
        <div className={styles.RewardsTotalContainer}>
          <div className={styles.Usd}>{totalUSD}</div>
        </div>

        <div className={styles.ClaimButtonContainer}>
          <ClaimRewardsButton
            rewardsTotal={claimableMeow}
            rewardsTotalInUSD={claimableRewardsUSD}
            className={styles.ClaimButton}
          />

          <div className={styles.ClaimableRewards}>
            <HoverCard
              iconTrigger={<IconInfoCircle className={styles.InfoIcon} size={18} />}
              content={renderHoverCardContent()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
