import * as React from 'react';

import { RewardsFAQModal } from '../rewards-faq-modal';
import { TooltipPopup } from '../tooltip-popup/tooltip-popup';
import { RewardsPopupContainer } from '../rewards-popup/container';

import { Status } from '@zero-tech/zui/components';
import { IconCurrencyDollar } from '@zero-tech/zui/icons';

import { bem } from '../../lib/bem';
import { formatWeiAmount } from '../../lib/number';

import classnames from 'classnames';
import './styles.scss';

const c = bem('rewards-bar');

export interface Properties {
  isFirstTimeLogin: boolean;
  isMessengerFullScreen: boolean;
  hasLoadedConversation: boolean;

  zeroPreviousDay: string;
  isRewardsLoading: boolean;
  showRewardsInTooltip: boolean;
  showRewardsInPopup: boolean;

  onRewardsPopupClose: () => void;
  onRewardsTooltipClose: () => void;
}

interface State {
  isRewardsPopupOpen: boolean;
  isRewardsFAQModalOpen: boolean;
}

export class RewardsBar extends React.Component<Properties, State> {
  state = {
    isRewardsPopupOpen: false,
    isRewardsFAQModalOpen: false,
  };

  constructor(props: Properties) {
    super(props);
    this.state.isRewardsPopupOpen = props.isFirstTimeLogin;
  }

  openRewards = () => {
    this.setState({
      isRewardsPopupOpen: true,
    });
  };

  closeRewards = () => {
    this.setState({ isRewardsPopupOpen: false });
    this.props.onRewardsPopupClose();
  };

  openRewardsFAQModal = () => this.setState({ isRewardsFAQModalOpen: true });
  closeRewardsFAQModal = () => this.setState({ isRewardsFAQModalOpen: false });
  closeRewardsTooltip = () => this.props.onRewardsTooltipClose();

  renderRewardsButton() {
    return (
      <TooltipPopup
        open={!this.props.isRewardsLoading && this.props.showRewardsInTooltip && this.props.isMessengerFullScreen}
        align='center'
        side='right'
        content={`You’ve earned ${formatWeiAmount(this.props.zeroPreviousDay)} ZERO today`}
        onClose={this.closeRewardsTooltip}
      >
        <div className={c('rewards-button-container')}>
          <button
            onClick={this.openRewards}
            className={classnames(c('rewards-button'), {
              [c('rewards-button', 'open')]:
                this.state.isRewardsPopupOpen && (this.props.hasLoadedConversation || !this.props.isFirstTimeLogin),
            })}
          >
            <div>Rewards</div>
            <div
              className={classnames(c('rewards-icon'), {
                [c('rewards-icon', 'open')]:
                  this.state.isRewardsPopupOpen && (this.props.hasLoadedConversation || !this.props.isFirstTimeLogin),
              })}
            >
              <IconCurrencyDollar size={16} />
              {!this.state.isRewardsPopupOpen && this.props.showRewardsInPopup && this.props.isMessengerFullScreen && (
                <Status type='idle' className={c('rewards-icon__status')} />
              )}
            </div>
          </button>
        </div>
      </TooltipPopup>
    );
  }

  render() {
    return (
      <div className={c('')}>
        {this.renderRewardsButton()}

        {this.state.isRewardsPopupOpen && (this.props.hasLoadedConversation || !this.props.isFirstTimeLogin) && (
          <RewardsPopupContainer
            onClose={this.closeRewards}
            openRewardsFAQModal={this.openRewardsFAQModal}
            isLoading={this.props.isRewardsLoading}
          />
        )}

        {this.state.isRewardsFAQModalOpen && (
          <RewardsFAQModal
            isRewardsFAQModalOpen={this.state.isRewardsFAQModalOpen}
            closeRewardsFAQModal={this.closeRewardsFAQModal}
          />
        )}
      </div>
    );
  }
}
