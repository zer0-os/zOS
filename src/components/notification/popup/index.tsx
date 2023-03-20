import React from 'react';
import { createPortal } from 'react-dom';
import { IconSettings2 } from '@zero-tech/zui/icons';
import { ModalConfirmation } from '@zero-tech/zui/ZUIProvider';
import { IconButton } from '../../icon-button';

import { NotificationListContainer } from '../list/container';

import './style.scss';

export interface Properties {}
interface State {
  showSettingsModal: boolean;
}
export class NotificationPopup extends React.Component<Properties, State> {
  state = { showSettingsModal: false };
  toggleSettings = (): void => {
    this.setState({ showSettingsModal: !this.state.showSettingsModal });
  };

  render() {
    return (
      <>
        {createPortal(this.renderPopup(), document.body)}
        {this.state.showSettingsModal && this.renderSettingsModal()}
      </>
    );
  }

  renderPopup() {
    return (
      <div className='notification-popup'>
        <div className='notification-popup_header'>
          <h3>Notifications</h3>
          <div className='notification-popup_settings'>
            <span className='notification-popup_settings-set'>
              <IconButton
                onClick={this.toggleSettings}
                Icon={IconSettings2}
                size={16}
                className='notification-popup_settings-icon'
              />
            </span>
          </div>
        </div>
        <NotificationListContainer />
      </div>
    );
  }

  renderSettingsModal = (): JSX.Element => {
    return (
      <div className='modal-notifications'>
        <ModalConfirmation
          onCancel={this.toggleSettings}
          title='Browser Notifications'
          confirmLabel='Dismiss'
        >
          Browser notifications will alert you to new direct messages and messages in channels. To turn them on, follow{' '}
          <a
            href='https://knowledge.hubspot.com/settings/why-am-i-not-receiving-push-notifications-in-my-browser'
            target='_blank'
          >
            this guide
          </a>{' '}
          for the browser you are using.
        </ModalConfirmation>
      </div>
    );
  };
}
