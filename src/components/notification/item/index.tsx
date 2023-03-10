import React from 'react';
import classNames from 'classnames';
import { Avatar } from '@zero-tech/zui/components/Avatar';

import './style.scss';

interface Properties {
  notRead?: boolean;
}

export class NotificationItem extends React.Component<Properties> {
  render() {
    return (
      <div
        className={classNames('notification-item__wrapper', {
          'notification-item__wrapper--not-read': this.props.notRead,
        })}
      >
        <div className='notification-item__left'>
          <Avatar
            userFriendlyName='Mic Brooklyn'
            type='circle'
            imageURL='https://picsum.photos/200/300'
            size='medium'
          />
        </div>
        <div className='notification-item__center'>
          <h4>Zero</h4>
          <p>You were mentioned in #product</p>
          <span>Just now</span>
        </div>
        <div className='notification-item__right'>{/* badge from zUI */}</div>
      </div>
    );
  }
}
