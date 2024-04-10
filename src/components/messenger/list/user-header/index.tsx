import * as React from 'react';

import { SettingsMenuContainer } from '../../../settings-menu/container';
import { IconButton } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconPlus } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './styles.scss';
import { RewardsToolTipContainer } from '../rewards-tooltip/container';

const cn = bemClassName('user-header');

export interface Properties {
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  userIsOnline: boolean;
  showRewardsTooltip: boolean;

  onLogout?: () => void;
  onVerifyId: () => void;
  startConversation: () => void;
}

export class UserHeader extends React.Component<Properties> {
  get userStatus(): 'active' | 'offline' {
    return this.props.userIsOnline ? 'active' : 'offline';
  }

  get isWalletAddress() {
    return this.props.userHandle.startsWith('0x');
  }

  renderVerifyIdButton() {
    return (
      <Button {...cn('verify-id-button')} variant={ButtonVariant.Secondary} isSubmit onPress={this.props.onVerifyId}>
        <div {...cn('verify-id-button-text')}>Verify ID</div>
      </Button>
    );
  }

  renderUserDetails() {
    return (
      <div {...cn('user-details')}>
        <div {...cn('name')}>{this.props.userName}</div>

        {this.props.userHandle && (
          <div {...cn('handle')}>
            {this.props.userHandle}
            {this.isWalletAddress && this.renderVerifyIdButton()}
          </div>
        )}
      </div>
    );
  }

  render() {
    return (
      <div {...cn('')}>
        <SettingsMenuContainer
          onLogout={this.props.onLogout}
          userName={this.props.userName}
          userHandle={this.props.userHandle}
          userAvatarUrl={this.props.userAvatarUrl}
          userStatus={this.userStatus}
        />
        {this.props.showRewardsTooltip && <RewardsToolTipContainer />}

        {this.renderUserDetails()}

        <IconButton Icon={IconPlus} onClick={this.props.startConversation} size={32} />
      </div>
    );
  }
}
