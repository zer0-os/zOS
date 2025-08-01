import * as React from 'react';

import { config } from '../../../config';

import { OverviewPanel } from './overview-panel';
import { Stage } from '../../../store/user-profile';
import { EditProfileContainer } from '../../edit-profile/container';
import { SettingsPanelContainer } from './settings-panel/container';
import { AccountManagementContainer } from './account-management-panel/container';
import { DownloadsPanel } from './downloads-panel';
import { LinkedAccountsPanel } from './linked-accounts-panel';
import { ZeroProPanel } from './zero-pro-panel';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(config.stripePublishableKey);

export interface Properties {
  stage: Stage;
  name: string;
  image: string;
  subHandle?: string;
  isZeroProSubscriber?: boolean;
  onClose: () => void;
  onLogout: () => void;
  onBackup: () => void;
  onEdit: () => void;
  onBackToOverview: () => void;
  onRewards: () => void;
  onSettings: () => void;
  onDownloads: () => void;
  onManageAccounts: () => void;
  onOpenLinkedAccounts: () => void;
  onOpenZeroPro: () => void;
}

export class UserProfile extends React.Component<Properties> {
  render() {
    return (
      <>
        {this.props.stage === Stage.Overview && (
          <OverviewPanel
            name={this.props.name}
            image={this.props.image}
            isZeroProSubscriber={this.props.isZeroProSubscriber}
            subHandle={this.props.subHandle}
            onBack={this.props.onClose}
            onOpenLogoutDialog={this.props.onLogout}
            onOpenBackupDialog={this.props.onBackup}
            onOpenEditProfile={this.props.onEdit}
            onOpenRewards={this.props.onRewards}
            onOpenSettings={this.props.onSettings}
            onOpenDownloads={this.props.onDownloads}
            onManageAccounts={this.props.onManageAccounts}
            onOpenLinkedAccounts={this.props.onOpenLinkedAccounts}
            onOpenZeroPro={this.props.onOpenZeroPro}
          />
        )}

        {this.props.stage === Stage.EditProfile && <EditProfileContainer onClose={this.props.onBackToOverview} />}
        {this.props.stage === Stage.Settings && <SettingsPanelContainer onClose={this.props.onBackToOverview} />}
        {this.props.stage === Stage.Downloads && <DownloadsPanel onClose={this.props.onBackToOverview} />}
        {this.props.stage === Stage.AccountManagement && (
          <AccountManagementContainer onClose={this.props.onBackToOverview} />
        )}
        {this.props.stage === Stage.LinkedAccounts && <LinkedAccountsPanel onBack={this.props.onBackToOverview} />}
        {this.props.stage === Stage.ZeroPro && (
          <Elements stripe={stripePromise}>
            <ZeroProPanel isZeroProSubscriber={this.props.isZeroProSubscriber} onClose={this.props.onBackToOverview} />
          </Elements>
        )}
      </>
    );
  }
}
