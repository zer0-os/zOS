import React from 'react';
import { NotificationItem } from '../item';

import './style.scss';

interface Properties {
  list?: any[];
}

export class NotificationList extends React.Component<Properties> {
  render() {
    return (
      <div className='notification-list__wrapper'>
        <div className='notification-list__head'>
          <h3>Notifications</h3>
          <div></div>
        </div>

        <div className='notification-list__items'>
          {Array.from(Array(10).keys()).map(() => (
            <NotificationItem />
          ))}
        </div>
      </div>
    );
  }
}
