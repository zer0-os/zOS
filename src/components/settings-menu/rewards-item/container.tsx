import * as React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { RewardsItem } from '.';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  totalUSD: string;
  totalMeow: string;
}

export class Container extends React.Component<Properties> {
  static mapState(_state: RootState): Partial<Properties> {
    return {
      totalUSD: '$1.00',
      totalMeow: '0.1',
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return <RewardsItem totalUSD={this.props.totalUSD} totalMeow={this.props.totalMeow} />;
  }
}
export const RewardsItemContainer = connectContainer<PublicProperties>(Container);
