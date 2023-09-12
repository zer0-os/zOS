import * as React from 'react';

import { IconLogOut3, IconUser1 } from '@zero-tech/zui/icons';
import { Address, Avatar, DropdownMenu, Modal } from '@zero-tech/zui/components';

import { bem } from '../../lib/bem';

import './styles.scss';
import { EditProfileContainer } from '../edit-profile/container';

export interface Properties {
  userName: string;
  userHandle: string;
  userAvatarUrl: string;

  onLogout: () => void;
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

  containsAtSymbol() {
    return this.props.userHandle.includes('@');
  }

  getUserHandle() {
    return this.containsAtSymbol() ? this.props.userHandle : <Address address={this.props.userHandle} />;
  }

  handleLogout = () => {
    this.props.onLogout();
  };

  handleOpenChange = (isOpen) => {
    this.setState({ isDropdownOpen: isOpen });
  };

  renderSettingsHeader() {
    const c = bem('header');
    return (
      <div className={c('')}>
        <Avatar size={'regular'} type={'circle'} imageURL={this.props.userAvatarUrl} />
        <div className={c('user-details')}>
          <div className={c('name')}>{this.props.userName}</div>
          <div className={c('address')}>{this.getUserHandle()}</div>
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

  render() {
    return (
      <>
        <DropdownMenu
          menuClassName={'settings-menu'}
          items={[
            {
              id: 'header',
              label: this.renderSettingsHeader(),
              onSelect: () => {},
            },
            {
              className: 'edit_profile',
              id: 'edit_profile',
              label: this.renderSettingsOption(<IconUser1 />, 'Edit Profile'),
              onSelect: this.openEditProfileDialog,
            },
            {
              className: 'divider',
              id: 'divider',
              label: <div />,
              onSelect: () => {},
            },
            {
              className: 'logout',
              id: 'logout',
              label: this.renderSettingsOption(<IconLogOut3 />, 'Log Out'),
              onSelect: () => this.handleLogout(),
            },
          ]}
          side='right'
          alignMenu='start'
          onOpenChange={this.handleOpenChange}
          trigger={
            <Avatar
              isActive={this.state.isDropdownOpen}
              size={'medium'}
              type={'circle'}
              imageURL={this.props.userAvatarUrl}
            />
          }
        />
        {this.renderEditProfileDialog()}
      </>
    );
  }
}
