import * as React from 'react';

import { IconLogOut3 } from '@zero-tech/zui/icons';
import { Avatar, DropdownMenu } from '@zero-tech/zui/components';

import { bem } from '../../lib/bem';

import './styles.scss';

const c = bem('settings-menu');

export interface Properties {
  userAvatarUrl: string;

  onLogout: () => void;
}

export class SettingsMenu extends React.Component<Properties> {
  handleLogout = () => {
    this.props.onLogout();
  };

  renderSettingsHeader() {
    return (
      <div className={c('user')}>
        <Avatar size={'regular'} type={'circle'} imageURL={this.props.userAvatarUrl} />
        <div className={c('user-details')}>
          <div className={c('user-name')}>User Name</div>
          <div className={c('user-address')}>User Address</div>
        </div>
      </div>
    );
  }

  renderSettingsOption(icon, label) {
    return (
      <div className={c('option')}>
        {icon} {label}
      </div>
    );
  }

  render() {
    return (
      <DropdownMenu
        menuClassName={c('')}
        items={[
          {
            id: 'header',
            label: this.renderSettingsHeader(),
            onSelect: () => {},
          },
          {
            id: 'log-out',
            label: this.renderSettingsOption(<IconLogOut3 />, 'Log Out'),
            onSelect: () => this.handleLogout(),
          },
        ]}
        side='right'
        alignMenu='start'
        trigger={<Avatar size={'medium'} type={'circle'} imageURL={this.props.userAvatarUrl} />}
      />
    );
  }
}
