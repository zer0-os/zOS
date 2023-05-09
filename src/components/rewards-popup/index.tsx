import * as React from 'react';

import { IconGift1, IconTrendUp1 } from '@zero-tech/zui/icons';
import { Button } from '@zero-tech/zui/components';
import { ReactComponent as ZeroSymbol } from '../../zero-symbol.svg';

import './styles.scss';
import { bem } from '../../lib/bem';
const c = bem('rewards-popup');

export interface Properties {
  usd: string;
  zero: string;
}

export class RewardsPopup extends React.Component<Properties> {
  render() {
    return (
      <div className={c('')}>
        <ZeroSymbol height={32} width={32} />
        <span className={c('heading')}>My Rewards</span>
        <div className={c('rewards-usd')}>{this.props.usd}</div>
        <div className={c('rewards-zero')}>{this.props.zero} ZERO</div>
        <div className={c('info-card')}>
          <div className={c('info-card__icon')}>
            <IconGift1 />
          </div>
          <div className={c('info-card__text')}>
            Earn rewards by direct messaging your friends. Your rewards are updated daily.
          </div>
        </div>
        <div className={c('info-card')}>
          <div className={c('info-card__icon')}>
            <IconTrendUp1 />
          </div>
          <div className={c('info-card__text')}>
            (Coming soon) Redeem your tokens for cash or vote on what you want to see in Zero.
          </div>
        </div>
        <Button className={c('button')} isDisabled={true}>
          Redeem coming soon
        </Button>
      </div>
    );
  }
}
