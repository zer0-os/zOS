import React from 'react';

import { Avatar } from '@zero-tech/zui/components';

import './styles.scss';
import { IconBell1, IconMessageSquare2 } from '@zero-tech/zui/icons';
import { NotificationPopup } from '../notification/popup';

export interface Properties {
  userImageUrl?: string;
  userIsOnline: boolean;
  isConversationListOpen: boolean;
  updateConversationState: (isOpen: boolean) => void;
}

interface State {
  isNotificationPopupOpen: boolean;
}

export class UserActions extends React.Component<Properties, State> {
  state = { isNotificationPopupOpen: false };

  get userStatus(): 'active' | 'offline' {
    return this.props.userIsOnline ? 'active' : 'offline';
  }

  toggleNotificationState = () => {
    this.setState({ isNotificationPopupOpen: !this.state.isNotificationPopupOpen });
  };

  toggleConversationListState = () => {
    this.props.updateConversationState(!this.props.isConversationListOpen);
  };

  render() {
    return (
      <>
        <div className='user-actions'>
          <button
            className='button-reset'
            onClick={this.toggleConversationListState}
          >
            <IconMessageSquare2 isFilled={this.props.isConversationListOpen} />
          </button>
          <button
            className='button-reset'
            onClick={this.toggleNotificationState}
          >
            <IconBell1 isFilled={this.state.isNotificationPopupOpen} />
          </button>
          <Avatar
            type='circle'
            size='regular'
            imageURL={this.props.userImageUrl}
            statusType={this.userStatus}
          />
        </div>
        {this.state.isNotificationPopupOpen && <NotificationPopup />}
      </>
    );
  }
}
