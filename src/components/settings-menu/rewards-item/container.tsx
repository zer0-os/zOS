import * as React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { RewardsItem } from '.';
import { calculateTotalPriceInUSDCents, formatUSD, formatWeiAmount } from '../../../lib/number';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  totalUSD: string;
  totalMeow: string;
}

export class Container extends React.Component<Properties> {
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

  render() {
    return <RewardsItem totalUSD={this.props.totalUSD} totalMeow={this.props.totalMeow} />;
  }
}
export const RewardsItemContainer = connectContainer<PublicProperties>(Container);
