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
  meow: string;
  isLoading: boolean;
  withTitleBar: boolean;

  onClose: () => void;
  openRewardsFAQModal: () => void;
}

interface State {
  rewardsFAQModalOpen: boolean;
}

export class RewardsPopup extends React.Component<Properties, State> {
  state = { rewardsFAQModalOpen: false };

  abort = () => {
    this.props.onClose();
  };

  preventAbortOnChildClick = (e) => {
    e.stopPropagation();
  };

  // close the rewards popup and open the rewards FAQ modal
  openRewardsFAQModal = (): void => {
    this.props.onClose();
    this.props.openRewardsFAQModal();
  };

  closeRewardsFAQModal = (): void => {
    this.setState({ rewardsFAQModalOpen: false });
  };

  render() {
    return (
      <div
        className={classnames(c(''), {
          [c('', 'full-screen')]: true, // todo: merge styles
          [c('', 'with-title')]: this.props.withTitleBar,
        })}
      >
        <div className={c('underlay')} onClick={this.abort}>
          <div className={c('content')} onClick={this.preventAbortOnChildClick}>
            <div className={c('arrow')}></div>
            <IconButton
              Icon={IconXClose}
              className={c('close-button')}
              variant='tertiary'
              size='large'
              onClick={this.abort}
            />
            <ZeroSymbol height={32} width={32} />
            <span className={c('heading')}>$MEOW</span>
            <div className={c('rewards-meow')}>
              <SkeletonText
                asyncText={{
                  isLoading: this.props.isLoading,
                  text: this.props.meow,
                }}
                skeletonOptions={{
                  width: 50,
                }}
              />
            </div>
            <div className={c('rewards-usd')}>{this.props.usd}</div>
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
                (Coming soon) Redeem your tokens for cash or vote on what you want to see in ZERO.
              </div>
            </div>
            <Button className={c('button')} isDisabled={true}>
              Redeem coming soon
            </Button>

            <div className={c('rewards-faq-text')} onClick={this.openRewardsFAQModal}>
              Learn more about ZERO rewards
            </div>
          </div>
        </div>
      </div>
    );
  }
}
