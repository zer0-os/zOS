import * as React from 'react';

import { createPortal } from 'react-dom';
import { connectContainer } from '../../store/redux-container';
import { RewardsPopup } from '.';
import { RootState } from '../../store/reducer';
import { fetch as fetchRewards } from '../../store/rewards';

interface PublicProperties {
  onClose: () => void;
}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  zero: number;

  fetchRewards: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const { rewards } = state;
    return {
      isLoading: rewards.loading,
      zero: rewards.zero,
    };
  }
  static mapActions() {
    return {
      fetchRewards,
    };
  }

  componentDidMount() {
    this.props.fetchRewards();
  }

  render() {
    return (
      <>
        {createPortal(
          <RewardsPopup usd={this.props.zero.toString()} zero={''} onClose={this.props.onClose} />,
          document.body
        )}
      </>
    );
  }
}

export const RewardsPopupContainer = connectContainer<PublicProperties>(Container);
