import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { openBackupDialog } from '../../store/matrix';
import { SettingsMenu } from '.';
import { openRewardsDialog } from '../../store/rewards';

export interface PublicProperties {
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  userStatus: 'active' | 'offline';

  onLogout: () => void;
}

export interface Properties extends PublicProperties {
  openBackupDialog: typeof openBackupDialog;
  openRewardsDialog: typeof openRewardsDialog;
}

export class Container extends React.Component<Properties> {
  static mapState(_state: RootState): Partial<Properties> {
    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { openBackupDialog, openRewardsDialog };
  }

  render() {
    return (
      <SettingsMenu
        userName={this.props.userName}
        userHandle={this.props.userHandle}
        userAvatarUrl={this.props.userAvatarUrl}
        userStatus={this.props.userStatus}
        onLogout={this.props.onLogout}
        onSecureBackup={this.props.openBackupDialog}
        onRewards={this.props.openRewardsDialog}
      />
    );
  }
}
export const SettingsMenuContainer = connectContainer<PublicProperties>(Container);
