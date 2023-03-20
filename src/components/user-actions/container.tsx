import React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store';
import { denormalizeConversations } from '../../store/channels-list';

import { UserActions } from '.';

interface PublicProperties {
  userImageUrl?: string;
  userIsOnline: boolean;
  isConversationListOpen: boolean;
  updateConversationState: (isOpen: boolean) => void;
}
export interface Properties extends PublicProperties {
  unreadConversationMessageCount: number;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const conversations = denormalizeConversations(state);

    const unreadConversationMessageCount = conversations.reduce(
      (count, conversation) => count + conversation.unreadCount,
      0
    );

    return {
      unreadConversationMessageCount,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <>
        <UserActions
          userImageUrl={this.props.userImageUrl}
          userIsOnline={this.props.userIsOnline}
          isConversationListOpen={this.props.isConversationListOpen}
          unreadConversationMessageCount={this.props.unreadConversationMessageCount}
          updateConversationState={this.props.updateConversationState}
        />
      </>
    );
  }
}

export const UserActionsContainer = connectContainer<PublicProperties>(Container);
