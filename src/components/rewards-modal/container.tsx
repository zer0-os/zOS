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
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { rewards } = state;
    return {
      totalUSD: formatUSD(calculateTotalPriceInUSDCents(rewards.meow, rewards.meowInUSD ?? 0)),
      totalMeow: `${formatWeiAmount(rewards.meow)} MEOW`,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <RewardsModal totalUSD={this.props.totalUSD} totalMeow={this.props.totalMeow} onClose={this.props.onClose} />
    );
  }
}
export const RewardsModalContainer = connectContainer<PublicProperties>(Container);
