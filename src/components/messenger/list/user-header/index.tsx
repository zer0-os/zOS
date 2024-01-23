import * as React from 'react';

import { SettingsMenu } from '../../../settings-menu';
import { IconButton } from '@zero-tech/zui/components';
import { IconPlus } from '@zero-tech/zui/icons';
import { Address } from '@zero-tech/zui/components';

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

  get isZID() {
    return this.props.userHandle.includes('0://');
  }

  get getUserHandle() {
    const { userHandle } = this.props;

    if (!userHandle) {
      return null;
    }

    return this.isZID ? userHandle : <Address {...cn('address')} address={userHandle} />;
  }

  render() {
    return (
      <div {...cn('')}>
        {this.props.includeUserSettings && (
          <SettingsMenu
            onLogout={this.props.onLogout}
            userName={this.props.userName}
            userHandle={this.getUserHandle}
            userAvatarUrl={this.props.userAvatarUrl}
            userStatus={this.userStatus}
          />
        )}
        <div {...cn('user-details')}>
          <div {...cn('name')}>{this.props.userName}</div>
          <div {...cn('handle')}>{this.getUserHandle}</div>
        </div>

        <IconButton Icon={IconPlus} onClick={this.props.startConversation} size={32} />
      </div>
    );
  }
}
