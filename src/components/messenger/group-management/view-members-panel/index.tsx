import * as React from 'react';

import { IconButton } from '@zero-tech/zui/components';
import { IconPlus } from '@zero-tech/zui/icons';
import { User } from '../../../../store/channels';
import { bemClassName } from '../../../../lib/bem';
import { CitizenListItem } from '../../../citizen-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { getTagForUser, sortMembers } from '../../list/utils/utils';

import './styles.scss';

const cn = bemClassName('view-members-panel');

export interface Properties {
  isOneOnOne: boolean;
  currentUser: User;
  otherMembers: User[];
  canAddMembers: boolean;
  conversationAdminIds: string[];
  conversationModeratorIds: string[];

  onAdd: () => void;
  onMemberSelected: (userId: string) => void;
  openUserProfile: () => void;
}

export class ViewMembersPanel extends React.Component<Properties> {
  getTag(user: User) {
    if (this.props.isOneOnOne) return null;

    return getTagForUser(user, this.props.conversationAdminIds, this.props.conversationModeratorIds);
  }

  addMember = () => {
    this.props.onAdd();
  };

  memberSelected = (userId: string) => {
    this.props.onMemberSelected(userId);
  };

  openProfile = () => {
    this.props.openUserProfile();
  };

  renderMembers = () => {
    const { otherMembers, conversationAdminIds, conversationModeratorIds } = this.props;
    const sortedOtherMembers = sortMembers(otherMembers, conversationAdminIds, conversationModeratorIds);

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
              tag={this.getTag(this.props.currentUser)}
              onSelected={this.openProfile}
            ></CitizenListItem>
            {sortedOtherMembers.map((u) => (
              <CitizenListItem
                key={u.userId}
                user={u}
                tag={this.getTag(u)}
                onSelected={this.memberSelected}
              ></CitizenListItem>
            ))}
          </ScrollbarContainer>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div {...cn()}>
        <div {...cn('body')}>{this.renderMembers()}</div>
      </div>
    );
  }
}
