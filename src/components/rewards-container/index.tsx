import * as React from 'react';

import { RewardsButton } from '../rewards-button';
import { RewardsFAQModal } from '../rewards-faq-modal';
import { RewardsPopupContainer } from '../rewards-popup/container';

export interface Properties {
  isFirstTimeLogin: boolean;
  hasLoadedConversation: boolean;

  meowPreviousDay: string;
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

export class RewardsContainer extends React.Component<Properties, State> {
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

  render() {
    return (
      <div>
        <RewardsButton
          openRewards={this.openRewards}
          closeRewardsTooltip={this.closeRewardsTooltip}
          meowPreviousDay={this.props.meowPreviousDay}
          isRewardsLoading={this.props.isRewardsLoading}
          isFirstTimeLogin={this.props.isFirstTimeLogin}
          isRewardsPopupOpen={this.state.isRewardsPopupOpen}
          showRewardsInTooltip={this.props.showRewardsInTooltip}
          showRewardsInPopup={this.props.showRewardsInPopup}
          hasLoadedConversation={this.props.hasLoadedConversation}
        />

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
