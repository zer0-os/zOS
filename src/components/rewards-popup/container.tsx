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
  zero: string;

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

  stringifyZero() {
    const stringValue = this.props.zero.padStart(19, '0');
    const whole = stringValue.slice(0, -18);
    const decimal = stringValue.slice(-18).slice(0, 4).replace(/0+$/, '');
    const decimalString = decimal.length > 0 ? `.${decimal}` : '';
    return `${whole}${decimalString}`;
  }

  render() {
    return (
      <>
        {createPortal(<RewardsPopup usd={this.stringifyZero()} zero='' onClose={this.props.onClose} />, document.body)}
      </>
    );
  }
}

export const RewardsPopupContainer = connectContainer<PublicProperties>(Container);
