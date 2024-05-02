import React from 'react';
import { connectContainer } from '../../../store/redux-container';

import { startAddGroupMember } from '../../../store/group-management';
import { RootState } from '../../../store/reducer';
import { User, denormalize as denormalizeChannel } from '../../../store/channels';
import { currentUserSelector } from '../../../store/authentication/selectors';
import { getUserSubHandle } from '../../../lib/user';
import { ViewMembersPanel } from './view-members-panel';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  currentUser: User;
  otherMembers: User[];
  conversationIcon: string;
  canAddMembers: boolean;
  conversationAdminIds: string[];

  startAddGroupMember: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId },
    } = state;

    const conversation = denormalizeChannel(activeConversationId, state);
    const currentUser = currentUserSelector(state);
    const conversationAdminIds = conversation?.adminMatrixIds;
    const isCurrentUserRoomAdmin = conversationAdminIds?.includes(currentUser?.matrixId) ?? false;

    return {
      currentUser: {
        firstName: currentUser?.profileSummary.firstName,
        lastName: currentUser?.profileSummary.lastName,
        profileImage: currentUser?.profileSummary.profileImage,
        matrixId: currentUser?.matrixId,
        isOnline: currentUser?.isOnline,
        primaryZID: currentUser?.primaryZID,
        displaySubHandle: getUserSubHandle(currentUser?.primaryZID, currentUser?.primaryWalletAddress),
      } as User,
      otherMembers: conversation ? conversation.otherMembers : [],
      canAddMembers: isCurrentUserRoomAdmin,
      conversationAdminIds,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      startAddGroupMember,
    };
  }

  render() {
    return (
      <>
        <ViewMembersPanel
          canAddMembers={this.props.canAddMembers}
          otherMembers={this.props.otherMembers}
          conversationAdminIds={this.props.conversationAdminIds}
          currentUser={this.props.currentUser}
          onAdd={this.props.startAddGroupMember}
        />
      </>
    );
  }
}

export const SecondarySidekickContent = connectContainer<PublicProperties>(Container);
