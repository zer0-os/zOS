import * as React from 'react';

import { EditProfileContainer } from '../edit-profile/container';
import { IconLock1, IconLogOut3, IconUser1 } from '@zero-tech/zui/icons';
import { Avatar, DropdownMenu, Modal } from '@zero-tech/zui/components';

import { bemClassName } from '../../lib/bem';

import './styles.scss';
import { SecureBackupContainer } from '../secure-backup/container';

const cn = bemClassName('settings-menu');

export interface Properties {
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  userStatus: 'active' | 'offline';

  onLogout: () => void;
}

interface State {
  isDropdownOpen: boolean;
  editProfileDialogOpen: boolean;
  backupDialogOpen: boolean;
}

export class SettingsMenu extends React.Component<Properties, State> {
  constructor(props) {
    super(props);
    this.state = {
      isDropdownOpen: false,
      editProfileDialogOpen: false,
      backupDialogOpen: false,
    };
  }

  handleLogout = () => {
    this.props.onLogout();
  };

  handleOpenChange = (isOpen) => {
    this.setState({ isDropdownOpen: isOpen });
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

  openBackupDialog = (): void => {
    this.setState({ backupDialogOpen: true });
  };
  closeBackupDialog = (): void => {
    this.setState({ backupDialogOpen: false });
  };

  renderEditProfileDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.editProfileDialogOpen} onOpenChange={this.closeEditProfileDialog}>
        <EditProfileContainer onClose={this.closeEditProfileDialog} />
      </Modal>
    );
  };

  renderBackupDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.backupDialogOpen} onOpenChange={this.closeBackupDialog} {...cn('secure-backup-modal')}>
        <SecureBackupContainer onClose={this.closeBackupDialog} />
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
      label: this.renderSettingsOption(<IconLock1 />, 'Secure Backup'),
      onSelect: this.openBackupDialog,
    });

    return [
      {
        id: 'header',
        label: this.renderSettingsHeader(),
        onSelect: () => {},
      },
      {
        className: 'divider',
        id: 'header-divider',
        label: <div />,
        onSelect: () => {},
      },
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
              isActive={this.state.isDropdownOpen}
              size={'medium'}
              type={'circle'}
              imageURL={this.props.userAvatarUrl}
              statusType={this.props.userStatus}
            />
          }
          itemSize='spacious'
        />
        {this.renderEditProfileDialog()}
        {this.renderBackupDialog()}
      </>
    );
  }
}
