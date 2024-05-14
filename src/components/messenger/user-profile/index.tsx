import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { PanelHeader } from '../list/panel-header';
import { Image, Modal } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant, Color as ButtonColor } from '@zero-tech/zui/components/Button';
import { IconCurrencyEthereum, IconLock1, IconLogOut3, IconPlus } from '@zero-tech/zui/icons';
import { LogoutConfirmationModalContainer } from '../../logout-confirmation-modal/container';
import { InviteDialogContainer } from '../../invite-dialog/container';

import './styles.scss';

const cn = bemClassName('user-profile');

export interface Properties {
  name: string;
  image: string;
  subHandle?: string;
  isLogoutOpen: boolean;

  onBack: () => void;
  onOpenLogoutDialog: () => void;
  onOpenBackupDialog: () => void;
}

interface State {
  isInviteDialogOpen: boolean;
}

export class UserProfile extends React.Component<Properties, State> {
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
          onPress={this.openBackupDialog}
          startEnhancer={<IconLock1 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Account Backup
        </Button>
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

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Profile'} onBack={this.navigateBack} />
        </div>

        <div {...cn('body')}>
          {this.renderDetails()}
          {this.renderActions()}
        </div>

        {this.renderFooter()}
        {this.renderInviteDialog()}
        {this.props.isLogoutOpen && <LogoutConfirmationModalContainer />}
      </div>
    );
  }
}
