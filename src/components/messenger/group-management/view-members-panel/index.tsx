import * as React from 'react';

import { IconButton } from '@zero-tech/zui/components';
import { IconPlus } from '@zero-tech/zui/icons';
import { User } from '../../../../store/channels';
import { bemClassName } from '../../../../lib/bem';
import { CitizenListItem } from '../../../citizen-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { getTagForUser, sortMembers } from '../../list/utils/utils';
import { Waypoint } from '../../../waypoint';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';

import './styles.scss';

const cn = bemClassName('view-members-panel');

const PAGE_SIZE = 20;

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

interface State {
  visibleMemberCount: number;
  isLoadingMore: boolean;
}

export class ViewMembersPanel extends React.Component<Properties, State> {
  state = {
    visibleMemberCount: PAGE_SIZE,
    isLoadingMore: false,
  };

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

  loadMoreMembers = () => {
    const { visibleMemberCount } = this.state;
    const { otherMembers } = this.props;
    const totalMembers = otherMembers.length;

    // Don't load more if we've already loaded all members or if we're already loading
    if (visibleMemberCount >= totalMembers || this.state.isLoadingMore) return;

    this.setState({ isLoadingMore: true }, () => {
      requestAnimationFrame(() => {
        this.setState({
          visibleMemberCount: Math.min(visibleMemberCount + PAGE_SIZE, totalMembers),
          isLoadingMore: false,
        });
      });
    });
  };

  renderMembers = () => {
    const { otherMembers, conversationAdminIds, conversationModeratorIds } = this.props;
    const { visibleMemberCount, isLoadingMore } = this.state;
    const sortedOtherMembers = sortMembers(otherMembers, conversationAdminIds, conversationModeratorIds);
    const visibleMembers = sortedOtherMembers.slice(0, visibleMemberCount);
    const hasMoreMembers = visibleMembers.length < sortedOtherMembers.length;

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
            {visibleMembers.map((u) => (
              <CitizenListItem
                key={u.userId}
                user={u}
                tag={this.getTag(u)}
                onSelected={this.memberSelected}
              ></CitizenListItem>
            ))}
          </ScrollbarContainer>

          {hasMoreMembers && (
            <div {...cn('waypoint-container')}>
              <Waypoint onEnter={this.loadMoreMembers} />
            </div>
          )}

          {isLoadingMore && (
            <div {...cn('loading-more')}>
              <Spinner />
            </div>
          )}
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
