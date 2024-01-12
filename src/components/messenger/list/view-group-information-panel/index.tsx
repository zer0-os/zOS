import * as React from 'react';

import { Button, IconButton, Image } from '@zero-tech/zui/components';
import { IconArrowNarrowLeft, IconPlus, IconUsers1 } from '@zero-tech/zui/icons';

import { User } from '../../../../store/channels';
import { bemClassName } from '../../../../lib/bem';
import { CitizenListItem } from '../../../citizen-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { isUserAdmin, sortMembers } from '../utils/utils';

import './styles.scss';

const cn = bemClassName('view-group-information-panel');

export interface Properties {
  name: string;
  icon: string;
  currentUser: User;
  otherMembers: User[];
  isCurrentUserRoomAdmin: boolean;
  conversationAdminIds: string[];

  onAdd: () => void;
  onEdit: () => void;
  onBack: () => void;
}

export class ViewGroupInformationPanel extends React.Component<Properties> {
  getTagForUser(user: User) {
    return isUserAdmin(user, this.props.conversationAdminIds) ? 'Admin' : null;
  }

  navigateBack = () => {
    this.props.onBack();
  };

  editGroup = () => {
    this.props.onEdit();
  };

  addMember = () => {
    this.props.onAdd();
  };

  renderDetails = () => {
    return (
      <div {...cn('details')}>
        <div {...cn('group-icon-conatiner')}>
          {this.props.icon ? (
            <Image {...cn('group-icon')} src={this.props.icon} alt='Custom Group Icon' />
          ) : (
            <div {...cn('group-icon')}>
              <IconUsers1 size={60} />
            </div>
          )}
        </div>

        {this.props.name && <div {...cn('group-name')}>{this.props.name}</div>}

        {this.props.isCurrentUserRoomAdmin && (
          <Button {...cn('edit-group-button')} onPress={this.editGroup} variant='text'>
            Edit
          </Button>
        )}
      </div>
    );
  };

  renderMembers = () => {
    const { otherMembers, conversationAdminIds } = this.props;
    const sortedOtherMembers = sortMembers(otherMembers, conversationAdminIds);

    return (
      <div {...cn('members')}>
        <div {...cn('member-header')}>
          <div {...cn('member-total')}>
            <span>{otherMembers.length + 1}</span> member{otherMembers.length + 1 === 1 ? '' : 's'}
          </div>
          {this.props.isCurrentUserRoomAdmin && (
            <IconButton {...cn('add-icon')} Icon={IconPlus} onClick={this.addMember} size={32} />
          )}
        </div>

        <div {...cn('member-list')}>
          <ScrollbarContainer>
            <CitizenListItem
              user={this.props.currentUser}
              tag={this.getTagForUser(this.props.currentUser)}
            ></CitizenListItem>
            {sortedOtherMembers.map((u) => (
              <CitizenListItem key={u.userId} user={u} tag={this.getTagForUser(u)}></CitizenListItem>
            ))}
          </ScrollbarContainer>
        </div>
      </div>
    );
  };

  renderBanner = () => {
    return (
      <div {...cn('banner-container')}>
        <div {...cn('banner')} />
      </div>
    );
  };

  renderBackIcon = () => {
    return (
      <div {...cn('back-icon-container')}>
        <IconButton {...cn('back-icon')} Icon={IconArrowNarrowLeft} onClick={this.navigateBack} isFilled size={32} />
      </div>
    );
  };

  render() {
    return (
      <div {...cn()}>
        {this.renderBanner()}
        {this.renderBackIcon()}
        <div {...cn('body')}>
          {this.renderDetails()}
          {this.renderMembers()}
        </div>
      </div>
    );
  }
}
