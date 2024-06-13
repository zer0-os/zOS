import * as React from 'react';

import { OverviewPanel } from './overview-panel';
import { Stage } from '../../../store/user-profile';
import { EditProfileContainer } from '../../edit-profile/container';
import { SettingsPanelContainer } from './settings-panel/container';
import { AccountManagementContainer } from './account-management-panel/container';

export interface Properties {
  stage: Stage;
  name: string;
  image: string;
  subHandle?: string;

  onClose: () => void;
  onLogout: () => void;
  onBackup: () => void;
  onEdit: () => void;
  onBackToOverview: () => void;
  onRewards: () => void;
  onSettings: () => void;
  onAccountManagement: () => void;
}

export class UserProfile extends React.Component<Properties> {
  render() {
    return (
      <>
        {this.props.stage === Stage.Overview && (
          <OverviewPanel
            name={this.props.name}
            image={this.props.image}
            subHandle={this.props.subHandle}
            onBack={this.props.onClose}
            onOpenLogoutDialog={this.props.onLogout}
            onOpenBackupDialog={this.props.onBackup}
            onOpenEditProfile={this.props.onEdit}
            onOpenRewards={this.props.onRewards}
            onOpenSettings={this.props.onSettings}
            onOpenAccountManagement={this.props.onAccountManagement}
          />
        )}

        {this.props.stage === Stage.EditProfile && <EditProfileContainer onClose={this.props.onBackToOverview} />}
        {this.props.stage === Stage.Settings && <SettingsPanelContainer onClose={this.props.onBackToOverview} />}
        {this.props.stage === Stage.AccountManagement && (
          <AccountManagementContainer onClose={this.props.onBackToOverview} />
        )}
      </>
    );
  }
}
