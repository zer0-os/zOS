import React from 'react';
import classNames from 'classnames';
import { Avatar } from '@zero-tech/zui/components/Avatar';

import './style.scss';
import moment from 'moment';
import { Status } from '@zero-tech/zui/components';

export interface Properties {
  body: string;
  createdAt: string;
  originatingName?: string;
  originatingImageUrl?: string;
  isUnread?: boolean;
}

export class NotificationItem extends React.Component<Properties> {
  get time() {
    return moment(this.props.createdAt).fromNow();
  }

  render() {
    return (
      <div
        className={classNames('notification-item__wrapper', {
          'notification-item__wrapper--not-read': this.props.isUnread,
        })}
      >
        <div className='notification-item__avatar'>
          <Avatar
            userFriendlyName={this.props.originatingName}
            type='circle'
            imageURL={this.props.originatingImageUrl}
            size='medium'
          />
        </div>
        <div className='notification-item__content'>
          <p className='notification-item__content-body'>{this.props.body}</p>
          <span className='notification-item__timestamp'>{this.time}</span>
        </div>
        {this.props.isUnread && (
          <div className='notification-item__right'>
            <Status type='unread' className='notification-item__status' />
          </div>
        )}
      </div>
    );
  }
}
