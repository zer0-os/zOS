import * as React from 'react';

import { Avatar, IconButton } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconPlus } from '@zero-tech/zui/icons';
import { RewardsToolTipContainer } from '../rewards-tooltip/container';

import { bemClassName } from '../../../../lib/bem';
import './styles.scss';

const cn = bemClassName('user-header');

export interface Properties {
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  userIsOnline: boolean;
  showRewardsTooltip: boolean;
  hasUnviewedRewards: boolean;

  onLogout?: () => void;
  onVerifyId: () => void;
  startConversation: () => void;
  openUserProfile: () => void;
  totalRewardsViewed: () => void;
}

export class UserHeader extends React.Component<Properties> {
  get userStatus(): 'active' | 'offline' {
    return this.props.userIsOnline ? 'active' : 'offline';
  }

  get isWalletAddress() {
    return this.props.userHandle.startsWith('0x');
  }

  get shouldAvatarHaveHighlight() {
    return this.props.hasUnviewedRewards;
  }

  openProfile = () => {
    this.props.openUserProfile();
    this.props.totalRewardsViewed();
  };

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
        <div {...cn('avatar-container')} onClick={this.openProfile}>
          <Avatar
            isActive={this.shouldAvatarHaveHighlight}
            size={'medium'}
            imageURL={this.props.userAvatarUrl}
            statusType={'active'}
          />
        </div>
        {this.props.showRewardsTooltip && <RewardsToolTipContainer />}

        {this.renderUserDetails()}

        <IconButton Icon={IconPlus} onClick={this.props.startConversation} size={32} />
      </div>
    );
  }
}
