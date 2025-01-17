import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';

import { PanelHeader } from '../../list/panel-header';
import { Image, Modal } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant, Color as ButtonColor } from '@zero-tech/zui/components/Button';
import {
  IconCurrencyEthereum,
  IconLink1,
  IconDownload2,
  IconLock1,
  IconLogOut3,
  IconPlus,
  IconSettings2,
  IconUser1,
  IconWallet3,
} from '@zero-tech/zui/icons';
import { InviteDialogContainer } from '../../../invite-dialog/container';
import { RewardsItemContainer } from './rewards-item/container';
import { featureFlags } from '../../../../lib/feature-flags';
import { ScrollbarContainer } from '../../../scrollbar-container';

import './styles.scss';

const cn = bemClassName('overview-panel');

export interface Properties {
  name: string;
  image: string;
  subHandle?: string;

  onBack: () => void;
  onOpenLogoutDialog: () => void;
  onOpenBackupDialog: () => void;
  onOpenEditProfile: () => void;
  onOpenRewards: () => void;
  onOpenSettings: () => void;
  onOpenDownloads: () => void;
  onManageAccounts: () => void;
  onOpenLinkedAccounts: () => void;
}

interface State {
  isInviteDialogOpen: boolean;
}

export class OverviewPanel extends React.Component<Properties, State> {
  state = {
    isInviteDialogOpen: false,
  };

  navigateBack = () => {
    this.props.onBack();
  };

  openInviteDialog = () => {
    this.setState({ isInviteDialogOpen: true });
  };

  closeInviteDialog = () => {
    this.setState({ isInviteDialogOpen: false });
  };

  renderInviteDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.isInviteDialogOpen} onOpenChange={this.closeInviteDialog}>
        <InviteDialogContainer onClose={this.closeInviteDialog} />
      </Modal>
    );
  };

  openLogoutDialog = () => {
    this.props.onOpenLogoutDialog();
  };

  openBackupDialog = () => {
    this.props.onOpenBackupDialog();
  };

  openEditProfile = () => {
    this.props.onOpenEditProfile();
  };

  openRewards = () => {
    this.props.onOpenRewards();
  };

  openSettings = () => {
    this.props.onOpenSettings();
  };

  openDownloads = () => {
    this.props.onOpenDownloads();
  };

  onManageAccounts = () => {
    this.props.onManageAccounts();
  };

  openLinkedAccounts = () => {
    this.props.onOpenLinkedAccounts();
  };

  renderDetails = () => {
    return (
      <div {...cn('details')}>
        <div {...cn('image-conatiner')}>
          {this.props.image ? (
            <Image {...cn('image')} src={this.props.image} alt='Custom Profile Image' />
          ) : (
            <div {...cn('image')}>
              <IconCurrencyEthereum size={50} />
            </div>
          )}
        </div>

        <div {...cn('name-container')}>
          {<div {...cn('name')}>{this.props.name}</div>}
          {this.props.subHandle && <div {...cn('sub-handle')}>{this.props.subHandle}</div>}
        </div>
      </div>
    );
  };

  renderActions() {
    return (
      <div {...cn('action-button-container')}>
        <Button
          {...cn('action-button', 'highlighted')}
          variant={ButtonVariant.Secondary}
          onPress={this.openInviteDialog}
          startEnhancer={<IconPlus size={20} isFilled />}
        >
          Invite Friends
        </Button>

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={this.openEditProfile}
          startEnhancer={<IconUser1 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Edit Profile
        </Button>

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={this.onManageAccounts}
          startEnhancer={<IconWallet3 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Manage Accounts
        </Button>

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={this.openBackupDialog}
          startEnhancer={<IconLock1 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Account Backup
        </Button>

        {featureFlags.enableUserSettings && (
          <Button
            {...cn('action-button')}
            variant={ButtonVariant.Secondary}
            onPress={this.openSettings}
            startEnhancer={<IconSettings2 size={20} />}
            color={ButtonColor.Greyscale}
          >
            Settings
          </Button>
        )}

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={this.openDownloads}
          startEnhancer={<IconDownload2 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Download
        </Button>

        {featureFlags.enableLinkedAccounts && (
          <Button
            {...cn('action-button')}
            variant={ButtonVariant.Secondary}
            onPress={this.openLinkedAccounts}
            startEnhancer={<IconLink1 size={20} />}
            color={ButtonColor.Greyscale}
          >
            Linked Accounts
          </Button>
        )}
      </div>
    );
  }

  renderFooter() {
    return (
      <div {...cn('footer')}>
        <Button
          {...cn('footer-button')}
          variant={ButtonVariant.Secondary}
          color={ButtonColor.Greyscale}
          onPress={this.openLogoutDialog}
          startEnhancer={<IconLogOut3 size={20} />}
        >
          Log Out
        </Button>
      </div>
    );
  }

  renderRewards() {
    return (
      <div {...cn('rewards')} onClick={this.openRewards}>
        <RewardsItemContainer />
      </div>
    );
  }

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Profile'} onBack={this.navigateBack} />
        </div>

        <ScrollbarContainer variant='on-hover'>
          <div {...cn('panel-content-wrapper')}>
            <div {...cn('body')}>
              <div {...cn('section')}>
                {this.renderDetails()}
                {featureFlags.enableRewards && this.renderRewards()}
              </div>

              {this.renderActions()}
            </div>

            {this.renderFooter()}
          </div>
        </ScrollbarContainer>

        {this.renderInviteDialog()}
      </div>
    );
  }
}
