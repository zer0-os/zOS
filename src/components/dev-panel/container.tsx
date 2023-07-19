import React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { DevPanel } from '.';
import { denormalize as denormalizeChannel } from '../../store/channels';
import { Message, MessageSendStatus, receive } from '../../store/messages';

interface PublicProperties {}

export interface Properties extends PublicProperties {
  messages: Message[];
  activeConversationId: string;

  toggleState(): void;
  updateMessage(message: Partial<Message>): void;
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

    if (!activeConversationId) {
      return { messages: [] };
    }

    const channel = denormalizeChannel(activeConversationId, state) || null;

    return {
      messages: channel?.messages || [],
      activeConversationId,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      updateMessage: receive,
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

  render() {
    return (
      <DevPanel
        messages={this.props.messages}
        isOpen={this.isOpen}
        onMessageStatusChanged={this.updateMessageStatus}
        toggleState={this.toggleState}
      />
    );
  }
}

export const DevPanelContainer = connectContainer<PublicProperties>(Container);
