import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { openConversation } from '../../../../store/channels';
import { createConversation } from '../../../../store/create-conversation';
import { denormalizeConversations } from '../../../../store/channels-list';
import { Channel } from '../../../../store/channels';
import { config } from '../../../../config';
import { LinkedAccountsPanel } from '.';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  telegramBotUserId: string;
  existingConversations: Channel[];

  createConversation: (payload: { userIds: string[] }) => void;
  openConversation: (payload: { conversationId: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const telegramBotUserId = config.telegramBotUserId;
    const existingConversations = denormalizeConversations(state);

    return { telegramBotUserId, existingConversations };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { createConversation, openConversation };
  }

  onTelegramBot = () => {
    const { existingConversations, telegramBotUserId, createConversation, openConversation } = this.props;

    const existingConversation = existingConversations?.find(
      (conversation) =>
        conversation.isOneOnOne &&
        conversation.otherMembers?.length === 1 &&
        conversation.otherMembers[0]?.userId === telegramBotUserId
    );

    if (existingConversation) {
      openConversation({ conversationId: existingConversation.id });
    } else {
      createConversation({ userIds: [telegramBotUserId] });
    }
  };

  render() {
    return <LinkedAccountsPanel onTelegramLink={this.onTelegramBot} onBack={this.props.onClose} />;
  }
}

export const LinkedAccountsPanelContainer = connectContainer<PublicProperties>(Container);
