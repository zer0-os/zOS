import * as React from 'react';

import { User } from '../../store/channels';
import { bemClassName } from '../../lib/bem';
import { Avatar } from '@zero-tech/zui/components';
import { displayName } from '../../lib/user';

import './styles.scss';
import { MemberManagementMenuContainer } from '../messenger/group-management/member-management-menu/container';
import classNames from 'classnames';

const cn = bemClassName('citizen-list-item');

export interface Properties {
  user: User;
  tag?: string;
  canRemove?: boolean;
  showMemberManagementMenu?: boolean;

  onSelected?: (userId: string) => void;
}

interface State {
  isMenuOpen: boolean;
}

export class CitizenListItem extends React.Component<Properties, State> {
  state: State = {
    isMenuOpen: false,
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

  onIsMenuOpenChange = (isOpen: boolean) => {
    this.setState({ isMenuOpen: isOpen });
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
          <Avatar size={'small'} imageURL={this.props.user.profileImage} tabIndex={-1} />
          <div {...cn('text-container')}>
            <span {...cn('name')}>{displayName(this.props.user)}</span>
            <span {...cn('handle')}>{this.props.user.displaySubHandle}</span>
          </div>
        </div>

        {this.props.tag && <div {...cn('tag')}>{this.props.tag}</div>}
        {this.props.showMemberManagementMenu && (
          <div
            className={classNames('citizen-list-item__remove', {
              'citizen-list-item__remove--menu-open': this.state.isMenuOpen,
            })}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MemberManagementMenuContainer
              user={this.props.user}
              onOpenChange={this.onIsMenuOpenChange}
              canRemove={this.props.canRemove}
            />
          </div>
        )}
      </div>
    );
  }
}
