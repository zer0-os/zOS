import React from 'react';

import { NotificationItem } from '../item';

import './style.scss';

interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}
export interface Properties {
  list?: Notification[];
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
          {this.props.list.map((n) => (
            <NotificationItem
              key={n.id}
              title={n.title}
              body={n.body}
              createdAt={n.createdAt}
            />
          ))}
        </div>
      </div>
    );
  }
}
