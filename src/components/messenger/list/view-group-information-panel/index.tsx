import * as React from 'react';

import { IconButton, Image } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant, Color as ButtonColor } from '@zero-tech/zui/components/Button';
import { IconArrowNarrowLeft, IconPlus, IconUserRight1, IconUsers1 } from '@zero-tech/zui/icons';

import { User } from '../../../../store/channels';
import { bemClassName } from '../../../../lib/bem';
import { CitizenListItem } from '../../../citizen-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { LeaveGroupDialogStatus } from '../../../../store/group-management';
import { isUserAdmin, sortMembers } from '../utils/utils';

import './styles.scss';

const cn = bemClassName('view-group-information-panel');

export interface Properties {
  name: string;
  icon: string;
  currentUser: User;
  otherMembers: User[];
  canAddMembers: boolean;
  canEditGroup: boolean;
  canLeaveGroup: boolean;
  conversationAdminIds: string[];

  onAdd: () => void;
  onLeave: (status: LeaveGroupDialogStatus) => void;
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

  openLeaveGroup = () => {
    this.props.onLeave(LeaveGroupDialogStatus.OPEN);
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

        {this.props.canEditGroup && (
          <Button {...cn('edit-group-button')} onPress={this.editGroup} variant={ButtonVariant.Secondary}>
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
          {this.props.canAddMembers && (
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

  renderLeaveGroupButton = () => {
    return (
      <Button
        {...cn('leave-group-button')}
        variant={ButtonVariant.Secondary}
        onPress={this.openLeaveGroup}
        startEnhancer={<IconUserRight1 size={18} />}
        color={ButtonColor.Red}
      >
        Leave Group
      </Button>
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
          {this.props.canLeaveGroup && this.renderLeaveGroupButton()}
        </div>
      </div>
    );
  }
}
