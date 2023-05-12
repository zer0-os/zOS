import * as React from 'react';

import { IconGift1, IconTrendUp1, IconXClose } from '@zero-tech/zui/icons';
import { Button, IconButton, SkeletonText } from '@zero-tech/zui/components';
import { ReactComponent as ZeroSymbol } from '../../zero-symbol.svg';

import './styles.scss';
import { bem } from '../../lib/bem';
import classnames from 'classnames';
const c = bem('rewards-popup');

export interface Properties {
  usd: string;
  zero: string;
  isLoading: boolean;
  isFullScreen: boolean;
  withTitleBar: boolean;

  onClose: () => void;
}

export class RewardsPopup extends React.Component<Properties> {
  abort = () => {
    this.props.onClose();
  };

  render() {
    return (
      <div
        className={classnames(c(''), {
          [c('', 'full-screen')]: this.props.isFullScreen,
          [c('', 'with-title')]: this.props.withTitleBar,
        })}
      >
        <div className={c('underlay')} onClick={this.abort}>
          <div className={c('content')}>
            <IconButton
              Icon={IconXClose}
              className={c('close-button')}
              variant='tertiary'
              color='greyscale'
              onClick={this.abort}
            />
            <ZeroSymbol height={32} width={32} />
            <span className={c('heading')}>My Rewards</span>
            <div className={c('rewards-usd')}>
              <SkeletonText
                asyncText={{
                  isLoading: this.props.isLoading,
                  text: this.props.usd,
                }}
                skeletonOptions={{
                  width: 50,
                }}
              />
            </div>
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
        </div>
      </div>
    );
  }
}
