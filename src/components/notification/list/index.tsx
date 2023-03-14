import React from 'react';

import { NotificationItem } from '../item';

import './style.scss';

export interface Properties {
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
          {this.props.list.map((n) => (
            <NotificationItem
              key={n.id}
              title='Network Name'
              body='You were mentioned in'
              createdAt={n.createdAt}
            />
          ))}
        </div>
      </div>
    );
  }
}
