import * as React from 'react';

import { createPortal } from 'react-dom';
import { connectContainer } from '../../store/redux-container';
import { RewardsPopup } from '.';
import { RootState } from '../../store/reducer';

interface PublicProperties {
  onClose: () => void;
  openRewardsFAQModal: () => void;

  zero: string;
  isLoading: boolean;
}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  isFullScreen: boolean;
  withTitleBar: boolean;

  fetchRewards: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      authentication: { user },
      layout,
    } = state;

    return {
      withTitleBar: !!user?.data?.isAMemberOfWorlds,
      isFullScreen: layout.value.isMessengerFullScreen,
    };
  }
  static mapActions() {
    return {};
  }

  render() {
    return (
      <>
        {createPortal(
          <RewardsPopup
            usd={this.props.zero} // Note: Temporarily rendering ZERO in the USD field
            zero=''
            onClose={this.props.onClose}
            openRewardsFAQModal={this.props.openRewardsFAQModal}
            isLoading={this.props.isLoading}
            isFullScreen={this.props.isFullScreen}
            withTitleBar={this.props.withTitleBar}
          />,
          document.body
        )}
      </>
    );
  }
}

export const RewardsPopupContainer = connectContainer<PublicProperties>(Container);
