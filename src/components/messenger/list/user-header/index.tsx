import * as React from 'react';

import { config } from '../../../../config';
import { SettingsMenu } from '../../../settings-menu';
import { IconButton } from '@zero-tech/zui/components';
import { IconPlus } from '@zero-tech/zui/icons';

import { featureFlags } from '../../../../lib/feature-flags';

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
  startConversation: () => void;
}

export class UserHeader extends React.Component<Properties> {
  get userStatus(): 'active' | 'offline' {
    return this.props.userIsOnline ? 'active' : 'offline';
  }

  get isWalletAddress() {
    return this.props.userHandle.startsWith('0x');
  }

  renderLink() {
    return (
      <a {...cn('link')} href={config.znsExplorerUrl} target='_blank' rel='noopener noreferrer'>
        Verify ID
      </a>
    );
  }

  renderUserDetails() {
    return (
      <div {...cn('user-details')}>
        <div {...cn('name')}>{this.props.userName}</div>

        {this.props.userHandle && (
          <div {...cn('handle')}>
            {this.props.userHandle}
            {featureFlags.allowVerifyId && this.isWalletAddress && this.renderLink()}
          </div>
        )}
      </div>
    );
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

        {this.renderUserDetails()}

        <IconButton Icon={IconPlus} onClick={this.props.startConversation} size={32} />
      </div>
    );
  }
}
