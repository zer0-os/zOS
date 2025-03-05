import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { MemberManagementAction, openMemberManagement } from '../../../../store/group-management';
import { User } from '../../../../store/channels';

import { MemberManagementMenu } from '.';
import { isUserModerator } from '../../list/utils/utils';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { denormalizedChannelSelector } from '../../../../store/channels/selectors';

export interface PublicProperties {
  user?: User;
  canRemove?: boolean;

  onOpenChange: (isOpen: boolean) => void;
}

export interface Properties extends PublicProperties {
  activeConversationId: string;
  conversationModeratorIds: string[];
  allowModeratorManagement: boolean;

  openMemberManagement: (params: { type: MemberManagementAction; roomId: string; userId: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      chat: { activeConversationId },
    } = state;

    const conversation = denormalizedChannelSelector(state, activeConversationId);
    const conversationModeratorIds = conversation?.moderatorIds;

    const currentUser = currentUserSelector(state);
    const isCurrentUserRoomAdmin = conversation?.adminMatrixIds?.includes(currentUser?.matrixId) ?? false;

    return {
      activeConversationId,
      conversationModeratorIds,
      allowModeratorManagement: isCurrentUserRoomAdmin,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { openMemberManagement };
  }

  openMemberManagement = (type: MemberManagementAction) => {
    const { activeConversationId, user } = this.props;
    this.props.openMemberManagement({ type, roomId: activeConversationId, userId: user.userId });
  };

  render() {
    return (
      <MemberManagementMenu
        onOpenMemberManagement={this.openMemberManagement}
        onOpenChange={this.props.onOpenChange}
        canRemove={this.props.canRemove}
        isUserModerator={isUserModerator(this.props.user, this.props.conversationModeratorIds)}
        allowModeratorManagement={this.props.allowModeratorManagement}
      />
    );
  }
}

export const MemberManagementMenuContainer = connectContainer<PublicProperties>(Container);
