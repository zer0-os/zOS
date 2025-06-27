import * as React from 'react';
import { User } from '../../store/channels';
import { bemClassName } from '../../lib/bem';
import { displayName } from '../../lib/user';
import { Wallet } from '../../store/authentication/types';

import './styles.scss';
import { MemberManagementMenuContainer } from '../messenger/group-management/member-management-menu/container';
import classNames from 'classnames';
import { MatrixAvatar } from '../matrix-avatar';
import { ProfileLinkNavigation } from '../profile-link-navigation';
import { ProfileCardHover } from '../profile-card/hover';
import { IconZeroProVerified } from '@zero-tech/zui/icons';
const cn = bemClassName('citizen-list-item');

export interface Properties {
  user: User;
  tag?: string;
  canRemove?: boolean;
  showMemberManagementMenu?: boolean;

  onSelected?: (userId: string) => void;
}

interface State {
  isMenuOpen: boolean;
}

export class CitizenListItem extends React.Component<Properties, State> {
  state: State = {
    isMenuOpen: false,
  };

  getThirdWebWalletAddress = () => {
    const { wallets } = this.props.user;
    if (!wallets?.length) return undefined;

    const thirdWebWallet = wallets.find((wallet: Wallet) => wallet.isThirdWeb);
    return thirdWebWallet?.publicAddress;
  };

  publishMemberClick = () => {
    if (this.props.onSelected) {
      this.props.onSelected(this.props.user.userId);
    }
  };

  publishMemberKeyDown = (event) => {
    if (event.key === 'Enter' && this.props.onSelected) {
      this.props.onSelected(this.props.user.userId);
    }
  };

  onIsMenuOpenChange = (isOpen: boolean) => {
    this.setState({ isMenuOpen: isOpen });
  };

  render() {
    return (
      <div
        {...cn('', this.props.onSelected && 'clickable')}
        onClick={this.publishMemberClick}
        onKeyDown={this.publishMemberKeyDown}
        tabIndex={0}
      >
        <div {...cn('details')}>
          <ProfileLinkNavigation
            primaryZid={this.props.user.primaryZID}
            thirdWebAddress={this.getThirdWebWalletAddress()}
          >
            {this.props.user.primaryZID || this.getThirdWebWalletAddress() ? (
              <ProfileCardHover
                userId={this.props.user.primaryZID?.replace('0://', '') ?? this.getThirdWebWalletAddress()}
              >
                <MatrixAvatar size={'small'} imageURL={this.props.user.profileImage} tabIndex={-1} />
              </ProfileCardHover>
            ) : (
              <MatrixAvatar size={'small'} imageURL={this.props.user.profileImage} tabIndex={-1} />
            )}
          </ProfileLinkNavigation>
          <div {...cn('text-container')}>
            <div {...cn('name-container')}>
              <span {...cn('name')}>{displayName(this.props.user)}</span>
              {this.props.user?.subscriptions?.zeroPro && <IconZeroProVerified size={16} />}
            </div>
            <span {...cn('handle')}>{this.props.user.displaySubHandle}</span>
          </div>
        </div>

        {this.props.tag && <div {...cn('tag')}>{this.props.tag}</div>}
        {this.props.showMemberManagementMenu && (
          <div
            className={classNames('citizen-list-item__remove', {
              'citizen-list-item__remove--menu-open': this.state.isMenuOpen,
            })}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MemberManagementMenuContainer
              user={this.props.user}
              onOpenChange={this.onIsMenuOpenChange}
              canRemove={this.props.canRemove}
            />
          </div>
        )}
      </div>
    );
  }
}
