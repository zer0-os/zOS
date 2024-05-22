import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { MemberManagementAction, openMemberManagement } from '../../../../store/group-management';
import { User, denormalize as denormalizeChannel } from '../../../../store/channels';

import { MemberManagementMenu } from '.';
import { isUserModerator } from '../../list/utils/utils';

export interface PublicProperties {
  user?: User;
  canRemove?: boolean;

  onOpenChange: (isOpen: boolean) => void;
}

export interface Properties extends PublicProperties {
  activeConversationId: string;
  conversationModeratorIds: string[];

  openMemberManagement: (params: { type: MemberManagementAction; roomId: string; userId: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      chat: { activeConversationId },
    } = state;

    const conversation = denormalizeChannel(activeConversationId, state);
    const conversationModeratorIds = conversation?.moderatorIds;

    return {
      activeConversationId,
      conversationModeratorIds,
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
      />
    );
  }
}

export const MemberManagementMenuContainer = connectContainer<PublicProperties>(Container);
