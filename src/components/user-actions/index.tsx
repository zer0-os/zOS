import React from 'react';

import { Avatar } from '@zero-tech/zui/components';

import './styles.scss';

export interface Properties {
  userImageUrl?: string;
  userIsOnline: boolean;
}

export class UserActions extends React.Component<Properties> {
  get userStatus(): 'active' | 'offline' {
    return this.props.userIsOnline ? 'active' : 'offline';
  }

  render() {
    return (
      <div className='user-actions'>
        <Avatar
          type='circle'
          size='regular'
          imageURL={this.props.userImageUrl}
          statusType={this.userStatus}
        />
      </div>
    );
  }
}
