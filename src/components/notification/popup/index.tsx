import React from 'react';
import { createPortal } from 'react-dom';

import { NotificationListContainer } from '../list/container';

import './style.scss';

export interface Properties {}

export class NotificationPopup extends React.Component<Properties> {
  render() {
    return <>{createPortal(this.renderPopup(), document.body)}</>;
  }

  renderPopup() {
    return (
      <div className='notification-popup'>
        <div className='notification-popup_title-bar'>
          <h3>Notifications</h3>
        </div>
        <NotificationListContainer />
      </div>
    );
  }
}
