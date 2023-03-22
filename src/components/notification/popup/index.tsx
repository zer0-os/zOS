import React from 'react';
import { createPortal } from 'react-dom';

import { NotificationListContainer } from '../list/container';

import './style.scss';

export interface Properties {
  onClickOutside: () => void;
}

export class NotificationPopup extends React.Component<Properties> {
  private notificationPopupRef;

  constructor(props) {
    super(props);
    this.notificationPopupRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.clickOutsideNotificationPopup, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.clickOutsideNotificationPopup, false);
  }

  clickOutsideNotificationPopup = (event: MouseEvent) => {
    if (!this.notificationPopupRef?.current?.contains(event.target) && this.props.onClickOutside) {
      this.props.onClickOutside();
    }
  };

  renderPopup() {
    return (
      <div
        className='notification-popup'
        ref={this.notificationPopupRef}
      >
        <div className='notification-popup_title-bar'>
          <h3>Notifications</h3>
        </div>
        <NotificationListContainer />
      </div>
    );
  }

  render() {
    return <>{createPortal(this.renderPopup(), document.body)}</>;
  }
}
