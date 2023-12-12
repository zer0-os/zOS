import React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { denormalizeConversations } from '../../store/channels-list';

import { UserActions } from '.';
import { denormalizeNotifications } from '../../store/notifications';

interface PublicProperties {
  userAddress: string;
  userImageUrl?: string;
  userIsOnline: boolean;
  onDisconnect: () => void;
}
export interface Properties extends PublicProperties {
  unreadConversationMessageCount: number;
  unreadNotificationCount: number;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const conversations = denormalizeConversations(state);

    const unreadConversationMessageCount = conversations.reduce(
      (count, conversation) => count + conversation.unreadCount,
      0
    );

    const unreadNotificationCount = denormalizeNotifications(state).filter((n) => n.isUnread).length;

    return {
      unreadConversationMessageCount,
      unreadNotificationCount,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <>
        <UserActions
          userAddress={this.props.userAddress}
          userImageUrl={this.props.userImageUrl}
          userIsOnline={this.props.userIsOnline}
          unreadConversationMessageCount={this.props.unreadConversationMessageCount}
          unreadNotificationCount={this.props.unreadNotificationCount}
          onDisconnect={this.props.onDisconnect}
        />
      </>
    );
  }
}

export const UserActionsContainer = connectContainer<PublicProperties>(Container);
