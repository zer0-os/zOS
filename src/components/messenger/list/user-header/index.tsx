import * as React from 'react';

import { SettingsMenu } from '../../../settings-menu';

import { bemClassName } from '../../../../lib/bem';
import './styles.scss';

const cn = bemClassName('user-header');

export interface Properties {
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  userIsOnline: boolean;

  includeUserSettings?: boolean;
  onLogout?: () => void;
}

export class UserHeader extends React.Component<Properties> {
  get userStatus(): 'active' | 'offline' {
    return this.props.userIsOnline ? 'active' : 'offline';
  }

  render() {
    return (
      <div {...cn('')}>
        {this.props.includeUserSettings && (
          <SettingsMenu
            onLogout={this.props.onLogout}
            userName={this.props.userName}
            userHandle={this.props.userHandle}
            userAvatarUrl={this.props.userAvatarUrl}
            userStatus={this.userStatus}
          />
        )}
        <div {...cn('user-name')}>{this.props.userName}</div>
      </div>
    );
  }
}
