import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { openBackupDialog } from '../../store/matrix';
import { SettingsMenu } from '.';
import { openRewardsDialog, totalRewardsViewed } from '../../store/rewards';

export interface PublicProperties {
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  userStatus: 'active' | 'offline';

  onLogout: () => void;
}

export interface Properties extends PublicProperties {
  hasUnviewedRewards: boolean;

  openBackupDialog: typeof openBackupDialog;
  openRewardsDialog: typeof openRewardsDialog;
  totalRewardsViewed: typeof totalRewardsViewed;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { rewards } = state;
    return {
      hasUnviewedRewards: rewards.showNewRewardsIndicator,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { openBackupDialog, openRewardsDialog, totalRewardsViewed };
  }

  render() {
    return (
      <SettingsMenu
        userName={this.props.userName}
        userHandle={this.props.userHandle}
        userAvatarUrl={this.props.userAvatarUrl}
        userStatus={this.props.userStatus}
        hasUnviewedRewards={this.props.hasUnviewedRewards}
        onOpen={this.props.totalRewardsViewed}
        onLogout={this.props.onLogout}
        onSecureBackup={this.props.openBackupDialog}
        onRewards={this.props.openRewardsDialog}
      />
    );
  }
}
export const SettingsMenuContainer = connectContainer<PublicProperties>(Container);
