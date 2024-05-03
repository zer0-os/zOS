import * as React from 'react';

import { IconButton } from '@zero-tech/zui/components';
import { IconPlus } from '@zero-tech/zui/icons';
import { User } from '../../../../store/channels';
import { bemClassName } from '../../../../lib/bem';
import { CitizenListItem } from '../../../citizen-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { isUserAdmin, sortMembers } from '../../list/utils/utils';

import './styles.scss';

const cn = bemClassName('view-members-panel');

export interface Properties {
  currentUser: User;
  otherMembers: User[];
  canAddMembers: boolean;
  conversationAdminIds: string[];

  onAdd: () => void;
}

export class ViewMembersPanel extends React.Component<Properties> {
  getTagForUser(user: User) {
    return isUserAdmin(user, this.props.conversationAdminIds) ? 'Admin' : null;
  }

  addMember = () => {
    this.props.onAdd();
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

  render() {
    return (
      <div {...cn()}>
        <div {...cn('body')}>{this.renderMembers()}</div>
      </div>
    );
  }
}
