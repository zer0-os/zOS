import React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { DevPanel } from '.';
import {
  Channel,
  ConversationStatus,
  denormalize as denormalizeChannel,
  rawReceive as receiveChannel,
} from '../../store/channels';
import { Message, MessageSendStatus, receive } from '../../store/messages';
import { denormalizeConversations } from '../../store/channels-list';
import { compareDatesDesc } from '../../lib/date';

interface PublicProperties {}

export interface Properties extends PublicProperties {
  messages: Message[];
  conversations: Channel[];

  toggleState(): void;
  updateMessage(message: Partial<Message>): void;
  updateConversation: (conversation: Partial<Channel>) => void;
}

interface State {
  isOpen: boolean;
}

export class Container extends React.Component<Properties, State> {
  state = { isOpen: false };

  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId },
    } = state;

    let messages = [];
    if (activeConversationId) {
      const channel = denormalizeChannel(activeConversationId, state) || {};
      messages = channel.messages || [];
    }

    const conversations = (denormalizeConversations(state) ?? []).sort((a, b) =>
      compareDatesDesc(a.lastMessage?.createdAt || a.createdAt, b.lastMessage?.createdAt || b.createdAt)
    );

    return {
      messages,
      conversations,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      updateMessage: receive,
      updateConversation: receiveChannel,
    };
  }

  get isOpen() {
    return this.state.isOpen;
  }

  toggleState = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  updateMessageStatus = (id, sendStatus: MessageSendStatus) => {
    this.props.updateMessage({ id, sendStatus });
  };

  updateConversationStatus = (id, conversationStatus: ConversationStatus) => {
    this.props.updateConversation({ id, conversationStatus });
  };

  render() {
    return (
      <DevPanel
        messages={this.props.messages}
        conversations={this.props.conversations}
        isOpen={this.isOpen}
        onMessageStatusChanged={this.updateMessageStatus}
        onConversationStatusChanged={this.updateConversationStatus}
        toggleState={this.toggleState}
      />
    );
  }
}

export const DevPanelContainer = connectContainer<PublicProperties>(Container);
