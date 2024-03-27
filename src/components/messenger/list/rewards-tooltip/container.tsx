import * as React from 'react';

import { connectContainer } from '../../../../store/redux-container';
import { RootState } from '../../../../store/reducer';
import { rewardsTooltipClosed } from '../../../../store/rewards';

import { RewardsTooltip } from '.';
import { formatUSD, calculateTotalPriceInUSDCents } from '../../../../lib/number';
export interface PublicProperties {}

export interface Properties extends PublicProperties {
  isOpen: boolean;
  meowPreviousDayInUSD: string;
  isLoading: boolean;
  meowTokenPriceInUSD: number;

  rewardsTooltipClosed: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { rewards } = state;

    return {
      meowPreviousDayInUSD: Container.totalPriceInUSD(rewards.meowPreviousDay, rewards.meowInUSD),
      isLoading: rewards.loading,
      meowTokenPriceInUSD: rewards.meowInUSD,
      isOpen: rewards.showRewardsInTooltip,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { rewardsTooltipClosed };
  }

  static totalPriceInUSD(meow: string, meowInUSD: number) {
    return formatUSD(calculateTotalPriceInUSDCents(meow, meowInUSD ?? 0));
  }

  render() {
    if (this.props.isLoading || this.props.meowTokenPriceInUSD === 0) {
      return null;
    }

    return (
      <RewardsTooltip
        meowPreviousDayInUSD={this.props.meowPreviousDayInUSD}
        onClose={this.props.rewardsTooltipClosed}
        open={this.props.isOpen}
      />
    );
  }
}
export const RewardsToolTipContainer = connectContainer<PublicProperties>(Container);
