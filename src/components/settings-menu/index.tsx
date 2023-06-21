import * as React from 'react';

import { IconLogOut3 } from '@zero-tech/zui/icons';
import { Avatar, DropdownMenu } from '@zero-tech/zui/components';

import { bem } from '../../lib/bem';

import './styles.scss';

export interface Properties {
  userAvatarUrl: string;

  onLogout: () => void;
}

export class SettingsMenu extends React.Component<Properties> {
  handleLogout = () => {
    this.props.onLogout();
  };

  renderSettingsHeader() {
    const c = bem('header');

    return (
      <div className={c('')}>
        <Avatar size={'regular'} type={'circle'} imageURL={this.props.userAvatarUrl} />
        <div className={c('user-details')}>
          <div className={c('name')}>User Name</div>
          <div className={c('address')}>User Address</div>
        </div>
      </div>
    );
  }

  renderSettingsOption(icon, label) {
    return (
      <div className={'option'}>
        {icon} {label}
      </div>
    );
  }

  render() {
    return (
      <DropdownMenu
        menuClassName={'settings-menu'}
        items={[
          {
            id: 'header',
            label: this.renderSettingsHeader(),
            onSelect: () => {},
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
        trigger={<Avatar size={'medium'} type={'circle'} imageURL={this.props.userAvatarUrl} />}
      />
    );
  }
}
