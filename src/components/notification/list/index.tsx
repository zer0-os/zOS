import React from 'react';
import { NotificationItem } from '../item';

import './style.scss';

interface Properties {
  list?: any[];
}

const stubNotificationProps = {
  title: 'Zero',
  body: 'You were mentioned in #Product',
  createdAt: '2023-03-13T22:33:34.945Z',
  originatingName: 'Zero',
  originatingImageUrl: 'https://picsum.photos/200/300',
};
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
            <NotificationItem {...stubNotificationProps} />
          ))}
        </div>
      </div>
    );
  }
}
