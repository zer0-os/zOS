import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { openRemoveMember } from '../../../../store/group-management';

import { MemberManagementMenu } from '.';

export interface PublicProperties {
  user?: any;
  canRemove?: boolean;

  onOpenChange: (isOpen: boolean) => void;
}

export interface Properties extends PublicProperties {
  activeConversationId: string;

  openRemoveMember: (params: { roomId: string; userId: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      chat: { activeConversationId },
    } = state;

    return {
      activeConversationId,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { openRemoveMember };
  }

  openRemoveMember = () => {
    const { activeConversationId, user } = this.props;
    this.props.openRemoveMember({ roomId: activeConversationId, userId: user.userId });
  };

  render() {
    return (
      <MemberManagementMenu
        onRemoveMember={this.openRemoveMember}
        onOpenChange={this.props.onOpenChange}
        canRemove={this.props.canRemove}
      />
    );
  }
}

export const MemberManagementMenuContainer = connectContainer<PublicProperties>(Container);
