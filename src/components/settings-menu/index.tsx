import * as React from 'react';

import { EditProfileContainer } from '../edit-profile/container';
import { IconLock1, IconLogOut3, IconUser1 } from '@zero-tech/zui/icons';
import { Avatar, DropdownMenu, Modal } from '@zero-tech/zui/components';

import { bemClassName } from '../../lib/bem';

import './styles.scss';
import { RewardsItemContainer } from './rewards-item/container';
import { featureFlags } from '../../lib/feature-flags';

export interface Properties {
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  userStatus: 'active' | 'offline';
  hasUnviewedRewards: boolean;

  onOpen: () => void;
  onLogout: () => void;
  onSecureBackup: () => void;
  onRewards: () => void;
}

interface State {
  isDropdownOpen: boolean;
  editProfileDialogOpen: boolean;
}

export class SettingsMenu extends React.Component<Properties, State> {
  constructor(props) {
    super(props);
    this.state = {
      isDropdownOpen: false,
      editProfileDialogOpen: false,
    };
  }

  handleLogout = () => {
    this.props.onLogout();
  };

  handleOpenChange = (isOpen) => {
    this.setState({ isDropdownOpen: isOpen });
    if (isOpen) {
      this.props.onOpen();
    }
  };

  renderSettingsHeader() {
    const cn = bemClassName('header');
    return (
      <div {...cn('')}>
        <Avatar size={'regular'} type={'circle'} imageURL={this.props.userAvatarUrl} />
        <div {...cn('user-details')}>
          <div {...cn('name')}>{this.props.userName}</div>
          <div {...cn('handle')}>{this.props.userHandle}</div>
        </div>
      </div>
    );
  }

  openEditProfileDialog = (): void => {
    this.setState({ editProfileDialogOpen: true });
  };

  closeEditProfileDialog = (): void => {
    this.setState({ editProfileDialogOpen: false });
  };

  renderEditProfileDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.editProfileDialogOpen} onOpenChange={this.closeEditProfileDialog}>
        <EditProfileContainer onClose={this.closeEditProfileDialog} />
      </Modal>
    );
  };

  renderSettingsOption(icon, label) {
    return (
      <div className={'option'}>
        {icon} {label}
      </div>
    );
  }

  get rewardsOption() {
    if (featureFlags.enableRewards) {
      return {
        id: 'rewards',
        label: <RewardsItemContainer />,
        onSelect: this.props.onRewards,
      };
    }
    return {
      className: 'divider',
      id: 'header-divider',
      label: <div />,
      onSelect: () => {},
    };
  }

  get menuItems() {
    const options = [
      {
        className: 'edit_profile',
        id: 'edit_profile',
        label: this.renderSettingsOption(<IconUser1 />, 'Edit Profile'),
        onSelect: this.openEditProfileDialog,
      },
    ];

    options.push({
      className: 'secure_backup',
      id: 'secure_backup',
      label: this.renderSettingsOption(<IconLock1 />, 'Account Backup'),
      onSelect: this.props.onSecureBackup,
    });

    return [
      {
        id: 'header',
        label: this.renderSettingsHeader(),
        onSelect: () => {},
      },
      this.rewardsOption,
      ...options,
      {
        className: 'divider',
        id: 'footer-divider',
        label: <div />,
        onSelect: () => {},
      },
      {
        className: 'logout',
        id: 'logout',
        label: this.renderSettingsOption(<IconLogOut3 />, 'Log Out'),
        onSelect: () => this.handleLogout(),
      },
    ];
  }

  get shouldAvatarHaveHighlight() {
    return this.props.hasUnviewedRewards || this.state.isDropdownOpen;
  }

  render() {
    return (
      <>
        <DropdownMenu
          menuClassName={'settings-menu'}
          items={this.menuItems}
          side='right'
          alignMenu='start'
          onOpenChange={this.handleOpenChange}
          trigger={
            <Avatar
              isActive={this.shouldAvatarHaveHighlight}
              size={'medium'}
              type={'circle'}
              imageURL={this.props.userAvatarUrl}
              statusType={this.props.userStatus}
            />
          }
          itemSize='spacious'
        />
        {this.renderEditProfileDialog()}
      </>
    );
  }
}
