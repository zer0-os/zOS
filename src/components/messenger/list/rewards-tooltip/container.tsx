import * as React from 'react';

import { connectContainer } from '../../../../store/redux-container';
import { RootState } from '../../../../store/reducer';
import { rewardsTooltipClosed } from '../../../../store/rewards';

import { RewardsTooltip } from '.';
import { Container as RewardsItemContainer } from '../../../settings-menu/rewards-item/container';
export interface PublicProperties {}

export interface Properties extends PublicProperties {
  meowPreviousDayInUSD: string;
  isLoading: boolean;

  rewardsTooltipClosed: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { rewards } = state;
    return {
      meowPreviousDayInUSD: RewardsItemContainer.totalPriceInUSD(rewards.meowPreviousDay, rewards.meowInUSD),
      isLoading: rewards.loading,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { rewardsTooltipClosed };
  }

  render() {
    if (this.props.isLoading || this.props.meowPreviousDayInUSD === '$0.00') {
      return null;
    }

    return (
      <RewardsTooltip
        meowPreviousDayInUSD={this.props.meowPreviousDayInUSD}
        onClose={this.props.rewardsTooltipClosed}
      />
    );
  }
}
export const RewardsToolTipContainer = connectContainer<PublicProperties>(Container);
