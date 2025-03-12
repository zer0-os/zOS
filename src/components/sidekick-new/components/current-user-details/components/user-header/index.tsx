/**
 * @note 04/02/2025
 * This component was moved from messenger-list to here, because it is only used in the sidekick.
 * It is no longer exclusive to Messenger.
 */

import * as React from 'react';

import { Avatar } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { RewardsToolTipContainer } from '../../../../../messenger/list/rewards-tooltip/container';

import { bemClassName } from '../../../../../../lib/bem';
import './styles.scss';

const cn = bemClassName('user-header');

export interface Properties {
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  hasUnviewedRewards: boolean;
  showRewardsTooltip: boolean;

  onVerifyId: () => void;
  openUserProfile: () => void;
  totalRewardsViewed: () => void;
}

export class UserHeader extends React.Component<Properties> {
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
        <div {...cn('user-details')}>
          <span {...cn('name')}>{this.props.userName}</span>
          {this.props.userHandle && (
            <div {...cn('handle')}>
              <span title={this.props.userHandle}>{this.props.userHandle}</span>
              <span>{this.isWalletAddress && this.renderVerifyIdButton()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}
