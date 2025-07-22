import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { RewardsModal } from '.';
import { calculateTotalPriceInUSDCents, formatUSD, formatWeiAmount } from '../../lib/number';

export interface PublicProperties {
  onClose: () => void;
}

export interface Properties extends PublicProperties {
  totalUSD: string;
  totalMeow: string;
  claimableRewardsUSD: string;
  claimableRewardsMeow: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { rewards } = state;

    const totalRewards =
      BigInt(rewards.totalDailyRewards) + BigInt(rewards.totalReferralFees) + BigInt(rewards.legacyRewards);
    const totalUSD = formatUSD(calculateTotalPriceInUSDCents(totalRewards.toString(), rewards.meowInUSD ?? 0));
    const totalMeow = `${formatWeiAmount(totalRewards.toString())} MEOW`;
    const claimableRewardsUSD = formatUSD(
      calculateTotalPriceInUSDCents(rewards.unclaimedRewards.toString(), rewards.meowInUSD ?? 0)
    );
    const claimableRewardsMeow = `${formatWeiAmount(rewards.unclaimedRewards.toString())} MEOW`;

    return {
      totalUSD,
      totalMeow,
      claimableRewardsUSD,
      claimableRewardsMeow,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <RewardsModal
        totalUSD={this.props.totalUSD}
        totalMeow={this.props.totalMeow}
        claimableRewardsUSD={this.props.claimableRewardsUSD}
        claimableRewardsMeow={this.props.claimableRewardsMeow}
        onClose={this.props.onClose}
      />
    );
  }
}
export const RewardsModalContainer = connectContainer<PublicProperties>(Container);
