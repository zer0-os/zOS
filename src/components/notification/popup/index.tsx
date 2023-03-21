import React from 'react';
import { createPortal } from 'react-dom';
import { IconSettings2 } from '@zero-tech/zui/icons';
import { ModalConfirmation } from '@zero-tech/zui/components';
import { IconButton } from '../../icon-button';

import { NotificationListContainer } from '../list/container';

import './style.scss';

export interface Properties {}
interface State {
  showSettingsModal: boolean;
  showSettingsPopup: boolean;
}
export class NotificationPopup extends React.Component<Properties, State> {
  state = { showSettingsModal: false, showSettingsPopup: false };
  toggleSettings = (): void => {
    this.setState({ showSettingsModal: !this.state.showSettingsModal, showSettingsPopup: false });
  };

  toggleSettingsPopup = (): void => {
    this.setState({ showSettingsPopup: !this.state.showSettingsPopup });
  };

  render() {
    return (
      <>
        {createPortal(this.renderPopup(), document.body)}
        {this.state.showSettingsPopup && createPortal(this.renderSettingsPopup(), document.body)}
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
                onClick={this.toggleSettingsPopup}
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

  renderSettingsPopup = (): JSX.Element => {
    return (
      <div className='settings-popup'>
        <span
          className='settings-popup__text'
          onClick={this.toggleSettings}
        >
          Turn on browser notifications
        </span>
      </div>
    );
  };

  renderSettingsModal = (): JSX.Element => {
    return (
      <div className='modal_notifications'>
        <ModalConfirmation
          open
          onCancel={this.toggleSettings}
          title='Browser Notifications'
          cancelLabel='Dismiss'
          confirmationLabel='ok'
          onConfirm={this.toggleSettings}
        >
          Browser notifications will alert you to new direct messages and messages in channels. To turn them on, follow
          <a
            className='modal_notifications-link'
            href='https://knowledge.hubspot.com/settings/why-am-i-not-receiving-push-notifications-in-my-browser'
            rel='noreferrer'
            target='_blank'
          >
            this guide
          </a>
          for the browser you are using.
        </ModalConfirmation>
      </div>
    );
  };
}
