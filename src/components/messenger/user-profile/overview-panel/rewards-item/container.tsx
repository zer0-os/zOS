import * as React from 'react';

import { connectContainer } from '../../../../../store/redux-container';
import { RootState } from '../../../../../store/reducer';
import { RewardsItem } from '.';
import { calculateTotalPriceInUSDCents, formatUSD, formatWeiAmount } from '../../../../../lib/number';

export interface PublicProperties {
  onClaimEarnings?: () => void;
}

export interface Properties extends PublicProperties {
  totalUSD: string;
  totalMeow: string;
}

export class Container extends React.Component<Properties> {
  state = { isLoading: false, error: '' };

  static mapState(state: RootState): Partial<Properties> {
    const { rewards } = state;
    return {
      totalUSD: Container.totalPriceInUSD(rewards.meow, rewards.meowInUSD),
      totalMeow: `${formatWeiAmount(rewards.meow)} MEOW`,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  static totalPriceInUSD(meow: string, meowInUSD: number) {
    return formatUSD(calculateTotalPriceInUSDCents(meow, meowInUSD ?? 0));
  }

  onClaimEarnings = async () => {
    // TODO: Implement claim earnings functionality
    console.log('Claim earnings clicked');

    this.setState({ isLoading: true, error: '' });

    // Mock timeout to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    this.setState({ isLoading: false, error: '' });

    if (this.props.onClaimEarnings) {
      this.props.onClaimEarnings();
    }
  };

  render() {
    return (
      <RewardsItem
        totalUSD={this.props.totalUSD}
        totalMeow={this.props.totalMeow}
        onClaimEarnings={this.onClaimEarnings}
        isLoading={this.state.isLoading}
        error={this.state.error}
      />
    );
  }
}
export const RewardsItemContainer = connectContainer<PublicProperties>(Container);
