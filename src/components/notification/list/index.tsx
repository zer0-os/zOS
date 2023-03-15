import React from 'react';

import { NotificationItem } from '../item';

import './style.scss';

interface Notification {
  id: string;
  body: string;
  createdAt: string;
  originatingName?: string;
  originatingImageUrl?: string;
}

export interface Properties {
  list?: Notification[];
}

export class NotificationList extends React.Component<Properties> {
  render() {
    return (
      <div className='notification-list__wrapper'>
        <div className='notification-list__items'>
          {this.props.list.map((n) => (
            <NotificationItem
              key={n.id}
              body={n.body}
              createdAt={n.createdAt}
              originatingName={n.originatingName}
              originatingImageUrl={n.originatingImageUrl}
            />
          ))}
        </div>
      </div>
    );
  }
}
