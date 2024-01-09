import * as React from 'react';

import { TooltipPopup } from '../tooltip-popup/tooltip-popup';

import { Status } from '@zero-tech/zui/components';
import { IconCurrencyDollar } from '@zero-tech/zui/icons';

import { bem } from '../../lib/bem';
import { formatWeiAmount } from '../../lib/number';

import classnames from 'classnames';
import './styles.scss';

const c = bem('rewards-button-container');

export interface Properties {
  isRewardsPopupOpen: boolean;
  isFirstTimeLogin: boolean;
  hasLoadedConversation: boolean;

  meowPreviousDay: string;
  isRewardsLoading: boolean;
  showRewardsInTooltip: boolean;
  showRewardsInPopup: boolean;

  openRewards: () => void;
  closeRewardsTooltip: () => void;
}

export class RewardsButton extends React.Component<Properties> {
  render() {
    return (
      <TooltipPopup
        open={!this.props.isRewardsLoading && this.props.showRewardsInTooltip}
        align='center'
        side='right'
        content={`You’ve earned ${formatWeiAmount(this.props.meowPreviousDay)} MEOW today`}
        onClose={this.props.closeRewardsTooltip}
      >
        <div className={c('')}>
          <button
            onClick={this.props.openRewards}
            className={classnames(c('rewards-button'), {
              [c('rewards-button', 'open')]:
                this.props.isRewardsPopupOpen && (this.props.hasLoadedConversation || !this.props.isFirstTimeLogin),
            })}
          >
            <div>Rewards</div>
            <div
              className={classnames(c('rewards-icon'), {
                [c('rewards-icon', 'open')]:
                  this.props.isRewardsPopupOpen && (this.props.hasLoadedConversation || !this.props.isFirstTimeLogin),
              })}
            >
              <IconCurrencyDollar size={16} />
              {!this.props.isRewardsPopupOpen && this.props.showRewardsInPopup && (
                <Status type='idle' className={c('rewards-icon__status')} />
              )}
            </div>
          </button>
        </div>
      </TooltipPopup>
    );
  }
}
