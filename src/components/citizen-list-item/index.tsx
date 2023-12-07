import * as React from 'react';

import { User } from '../../store/channels';
import { bemClassName } from '../../lib/bem';
import { Avatar, IconButton } from '@zero-tech/zui/components';

import './styles.scss';
import { IconXClose } from '@zero-tech/zui/icons';
const cn = bemClassName('citizen-list-item');

export interface Properties {
  user: User;
  tag?: string;

  onRemove?: (userId: string) => void;
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

  publishRemove = () => {
    this.props.onRemove(this.props.user.userId);
  };

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
        {this.props.tag && <div {...cn('tag')}>{this.props.tag}</div>}
        {this.props.onRemove && (
          <div {...cn('remove')}>
            <IconButton Icon={IconXClose} onClick={this.publishRemove} />
          </div>
        )}
      </div>
    );
  }
}
