import { IconBellRinging1 } from '@zero-tech/zui/icons';
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
        {this.props.list.length > 0 && (
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
        )}
        {this.props.list.length <= 0 && (
          <div className='notification-empty-list'>
            <IconBellRinging1 size='56' />
            <div className='notification-empty-list__title'>Clear.</div>
            <div>You'll be notified about important things here.</div>
          </div>
        )}
      </div>
    );
  }
}
