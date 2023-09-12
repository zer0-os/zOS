import * as React from 'react';

import { createPortal } from 'react-dom';
import { connectContainer } from '../../store/redux-container';
import { RewardsPopup } from '.';
import { RootState } from '../../store/reducer';
import { calculateTotalPriceInUSD, formatWeiAmount } from '../../lib/number';

interface PublicProperties {
  onClose: () => void;
  openRewardsFAQModal: () => void;

  isLoading: boolean;
}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  isFullScreen: boolean;
  withTitleBar: boolean;
  zero: string;
  zeroInUSD: number;

  fetchRewards: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      authentication: { user },
      layout,
      rewards,
    } = state;

    return {
      withTitleBar: !!user?.data?.isAMemberOfWorlds,
      isFullScreen: layout.value.isMessengerFullScreen,
      zero: rewards.zero,
      zeroInUSD: rewards.zeroInUSD,
    };
  }

  static mapActions() {
    return {};
  }

  get totalPriceInUSD() {
    // if there is an error fetching the price, don't show the usd value
    if (this.props.zeroInUSD === 0) {
      return '';
    }

    return calculateTotalPriceInUSD(this.props.zero, this.props.zeroInUSD);
  }

  render() {
    return (
      <>
        {createPortal(
          <RewardsPopup
            usd={this.totalPriceInUSD}
            zero={formatWeiAmount(this.props.zero)}
            onClose={this.props.onClose}
            openRewardsFAQModal={this.props.openRewardsFAQModal}
            isLoading={this.props.isLoading}
            isFullScreen={this.props.isFullScreen}
            withTitleBar={this.props.withTitleBar}
          />,
          document.body
        )}
      </>
    );
  }
}

export const RewardsPopupContainer = connectContainer<PublicProperties>(Container);
