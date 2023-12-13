import React from 'react';

import { Avatar } from '@zero-tech/zui/components';

import './styles.scss';
import { IconBell1, IconMessageSquare2 } from '@zero-tech/zui/icons';
import { NotificationPopup } from '../notification/popup';
import { UserMenuPopup } from './user-menu-popup';
import { featureFlags } from '../../lib/feature-flags';

export interface Properties {
  userAddress: string;
  userImageUrl?: string;
  userIsOnline: boolean;
  unreadConversationMessageCount: number;
  unreadNotificationCount: number;
  onDisconnect: () => void;
}

interface State {
  isNotificationPopupOpen: boolean;
  isUserPopupOpen: boolean;
}

export class UserActions extends React.Component<Properties, State> {
  private notificationIconRef;

  constructor(props) {
    super(props);
    this.notificationIconRef = React.createRef();
  }

  state = { isNotificationPopupOpen: false, isUserPopupOpen: false };

  get userStatus(): 'active' | 'offline' {
    return this.props.userIsOnline ? 'active' : 'offline';
  }

  get unreadConversationCount() {
    return this.props.unreadConversationMessageCount <= 9 ? this.props.unreadConversationMessageCount : '9+';
  }

  get unreadNotificationCount() {
    return this.props.unreadNotificationCount <= 9 ? this.props.unreadNotificationCount : '9+';
  }

  toggleNotificationState = () => {
    this.setState({ isNotificationPopupOpen: !this.state.isNotificationPopupOpen });
  };

  handleClickOutsideNotificationPopup = () => {
    this.setState({ isNotificationPopupOpen: false });
  };

  toggleUserPopupState = () => {
    this.setState({ isUserPopupOpen: !this.state.isUserPopupOpen });
  };

  render() {
    return (
      <>
        <div className='user-actions'>
          <button className='user-actions__icon-button'>
            <IconMessageSquare2 isFilled />
            {this.props.unreadConversationMessageCount > 0 && (
              <div className='user-actions__badge'>{this.unreadConversationCount}</div>
            )}
          </button>
          {!featureFlags.enableMatrix && (
            <button
              className='user-actions__icon-button'
              ref={this.notificationIconRef}
              onClick={this.toggleNotificationState}
            >
              <IconBell1 isFilled={this.state.isNotificationPopupOpen} />
              {this.props.unreadNotificationCount > 0 && (
                <div className='user-actions__badge'>{this.unreadNotificationCount}</div>
              )}
            </button>
          )}
          <button onClick={this.toggleUserPopupState}>
            <Avatar type='circle' size='regular' imageURL={this.props.userImageUrl} statusType={this.userStatus} />
          </button>
        </div>
        {this.state.isNotificationPopupOpen && (
          <NotificationPopup
            onClickOutside={this.handleClickOutsideNotificationPopup}
            notificationIconRef={this.notificationIconRef}
          />
        )}
        <UserMenuPopup
          address={this.props.userAddress}
          onDisconnect={this.props.onDisconnect}
          onAbort={this.toggleUserPopupState}
          isOpen={this.state.isUserPopupOpen}
        />
      </>
    );
  }
}
