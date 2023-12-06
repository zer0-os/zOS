import * as React from 'react';

import { User } from '../../store/channels';
import { bemClassName } from '../../lib/bem';
import { Avatar } from '@zero-tech/zui/components';

import './styles.scss';
const cn = bemClassName('citizen-list-item');

export interface Properties {
  user: User;
}

export class CitizenListItem extends React.Component<Properties> {
  get displayName() {
    if (!this.props.user.firstName && !this.props.user.lastName) {
      return 'Unknown';
    }

    return `${this.props.user.firstName ?? ''} ${this.props.user.lastName ?? ''}`;
  }

  get statusType() {
    return this.props.user.isOnline ? 'active' : 'offline';
  }

  render() {
    return (
      <div {...cn()}>
        <Avatar
          size={'medium'}
          type={'circle'}
          imageURL={this.props.user.profileImage}
          tabIndex={-1}
          statusType={this.statusType}
        />
        <span {...cn('name')}>{this.displayName}</span>
      </div>
    );
  }
}
