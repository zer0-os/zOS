import * as React from 'react';

import { User } from '../../store/channels';
import { bemClassName } from '../../lib/bem';
import { Avatar, IconButton } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';
import { displayName } from '../../lib/user';

import './styles.scss';

const cn = bemClassName('citizen-list-item');

export interface Properties {
  user: User;
  tag?: string;

  onRemove?: (userId: string) => void;
  onSelected?: (userId: string) => void;
}

export class CitizenListItem extends React.Component<Properties> {
  get statusType() {
    return this.props.user.isOnline ? 'active' : 'offline';
  }

  publishRemove = () => {
    this.props.onRemove(this.props.user.userId);
  };

  publishMemberClick = () => {
    if (this.props.onSelected) {
      this.props.onSelected(this.props.user.userId);
    }
  };

  publishMemberKeyDown = (event) => {
    if (event.key === 'Enter' && this.props.onSelected) {
      this.props.onSelected(this.props.user.userId);
    }
  };

  render() {
    return (
      <div
        {...cn('', this.props.onSelected && 'clickable')}
        onClick={this.publishMemberClick}
        onKeyDown={this.publishMemberKeyDown}
        tabIndex={0}
      >
        <div {...cn('details')}>
          <Avatar size={'small'} imageURL={this.props.user.profileImage} tabIndex={-1} statusType={this.statusType} />
          <div {...cn('text-container')}>
            <span {...cn('name')}>{displayName(this.props.user)}</span>
            <span {...cn('handle')}>{this.props.user.displaySubHandle}</span>
          </div>
        </div>

        {this.props.tag && <div {...cn('tag')}>{this.props.tag}</div>}
        {this.props.onRemove && (
          <div {...cn('remove')}>
            <IconButton Icon={IconXClose} size={24} onClick={this.publishRemove} />
          </div>
        )}
      </div>
    );
  }
}
