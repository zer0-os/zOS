import * as React from 'react';

import { createPortal } from 'react-dom';
import { connectContainer } from '../../store/redux-container';
import { RewardsPopup } from '.';
import { RootState } from '../../store/reducer';
import { calculateTotalPriceInUSDCents, formatUSD, formatWeiAmount } from '../../lib/number';

interface PublicProperties {
  onClose: () => void;
  openRewardsFAQModal: () => void;

  isLoading: boolean;
}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  withTitleBar: boolean;
  meow: string;
  meowInUSD: number;

  fetchRewards: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      authentication: { user },
      rewards,
    } = state;

    return {
      withTitleBar: !!user?.data?.isAMemberOfWorlds,
      meow: rewards.meow,
      meowInUSD: rewards.meowInUSD,
    };
  }

  static mapActions() {
    return {};
  }

  get totalPriceInUSD() {
    // if there is an error fetching the price, don't show the usd value
    if (this.props.meowInUSD === 0) {
      return '';
    }

    return formatUSD(calculateTotalPriceInUSDCents(this.props.meow, this.props.meowInUSD));
  }

  render() {
    return (
      <>
        {createPortal(
          <RewardsPopup
            usd={this.totalPriceInUSD}
            meow={formatWeiAmount(this.props.meow)}
            onClose={this.props.onClose}
            openRewardsFAQModal={this.props.openRewardsFAQModal}
            isLoading={this.props.isLoading}
            withTitleBar={this.props.withTitleBar}
          />,
          document.body
        )}
      </>
    );
  }
}

export const RewardsPopupContainer = connectContainer<PublicProperties>(Container);
