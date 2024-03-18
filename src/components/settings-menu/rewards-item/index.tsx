import * as React from 'react';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';

const cn = bemClassName('rewards-item');

export interface Properties {
  totalUSD: string;
  totalMeow: string;
}

export class RewardsItem extends React.Component<Properties> {
  render() {
    return (
      <div {...cn()}>
        <div>Total</div>
        <div {...cn('usd')}>{this.props.totalUSD}</div>
        <div {...cn('meow')}>{this.props.totalMeow}</div>
      </div>
    );
  }
}
