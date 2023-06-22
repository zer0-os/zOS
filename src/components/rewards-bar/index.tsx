import { Status } from '@zero-tech/zui/components';
import { IconCurrencyDollar } from '@zero-tech/zui/icons';
import classnames from 'classnames';
import * as React from 'react';
import { RewardsFAQModal } from '../rewards-faq-modal';
import { RewardsPopupContainer } from '../rewards-popup/container';
import { TooltipPopup } from '../tooltip-popup/tooltip-popup';
import { SettingsMenu } from '../settings-menu';
import { bem } from '../../lib/bem';

import './styles.scss';

const c = bem('rewards-bar');

export interface Properties {
  isFirstTimeLogin: boolean;
  includeRewardsAvatar: boolean;

  userName: string;
  userHandle: string;
  userAvatarUrl: string;

  zero: string;
  zeroPreviousDay: string;
  isRewardsLoading: boolean;
  showNewRewards: boolean;

  onLogout: () => void;
  onRewardsPopupClose: () => void;
}

interface State {
  isRewardsPopupOpen: boolean;
  isRewardsFAQModalOpen: boolean;
  isRewardsTooltipOpen: boolean;
}

export class RewardsBar extends React.Component<Properties, State> {
  state = {
    isRewardsPopupOpen: false,
    isRewardsFAQModalOpen: false,
    isRewardsTooltipOpen: true, // initally open, will close after user clicks on 'x' button
  };

  constructor(props: Properties) {
    super(props);
    this.state.isRewardsPopupOpen = props.isFirstTimeLogin;
    this.state.isRewardsTooltipOpen = !props.isFirstTimeLogin;
  }

  stringifyZero(zero: string) {
    const stringValue = zero.padStart(19, '0');
    const whole = stringValue.slice(0, -18);
    const decimal = stringValue.slice(-18).slice(0, 4).replace(/0+$/, '');
    const decimalString = decimal.length > 0 ? `.${decimal}` : '';
    return `${whole}${decimalString}`;
  }

  openRewards = () => {
    this.setState({
      isRewardsPopupOpen: true,
      isRewardsTooltipOpen: false,
    });
  };

  closeRewards = () => {
    this.setState({ isRewardsPopupOpen: false });
    this.props.onRewardsPopupClose();
  };

  openRewardsFAQModal = () => this.setState({ isRewardsFAQModalOpen: true });
  closeRewardsFAQModal = () => this.setState({ isRewardsFAQModalOpen: false });
  closeRewardsTooltip = () => this.setState({ isRewardsTooltipOpen: false });

  renderRewardsBar() {
    return (
      <div
        className={classnames(c('rewards-bar'), {
          [c('rewards-bar', 'with-avatar')]: this.props.includeRewardsAvatar,
        })}
      >
        {this.props.includeRewardsAvatar && (
          <SettingsMenu
            onLogout={this.props.onLogout}
            userName={this.props.userName}
            userHandle={this.props.userHandle}
            userAvatarUrl={this.props.userAvatarUrl}
          />
        )}
        <button
          onClick={this.openRewards}
          className={classnames(c('rewards-button'), {
            [c('rewards-button', 'open')]: this.state.isRewardsPopupOpen,
          })}
        >
          <div>Rewards</div>
          <div className={c('rewards-icon')}>
            <IconCurrencyDollar size={16} />
            {this.props.showNewRewards && <Status type='idle' className={c('rewards-icon__status')} />}
          </div>
        </button>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.props.showNewRewards ? (
          <TooltipPopup
            open={!this.props.isRewardsLoading && this.state.isRewardsTooltipOpen}
            align='center'
            side='left'
            content={`You’ve earned ${this.stringifyZero(this.props.zeroPreviousDay)} ZERO today`}
            onClose={this.closeRewardsTooltip}
          >
            {this.renderRewardsBar()}
          </TooltipPopup>
        ) : (
          this.renderRewardsBar()
        )}

        {this.state.isRewardsPopupOpen && (
          <RewardsPopupContainer
            onClose={this.closeRewards}
            openRewardsFAQModal={this.openRewardsFAQModal} // modal is opened in the popup, after which the popup is closed
            zero={this.stringifyZero(this.props.zero)}
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
