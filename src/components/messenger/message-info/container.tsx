import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { MessageInfo } from '.';
import { RootState } from '../../../store/reducer';
import { closeMessageInfo } from '../../../store/message-info';
import { denormalize as denormalizeChannel } from '../../../store/channels';
import { User } from '../../../store/channels';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  readBy: User[];
  sentTo: User[];

  closeMessageInfo: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId },
      messageInfo: { selectedMessageId },
    } = state;

    const channel = denormalizeChannel(activeConversationId, state) || {};
    const messages = channel.messages || [];
    const selectedMessage = messages.find((msg) => msg.id === selectedMessageId) || {};

    const readBy = selectedMessage.readBy || [];
    const sentTo = (channel.otherMembers || []).filter(
      (user) => !readBy.some((readUser) => readUser.userId === user.userId)
    );

    return {
      readBy,
      sentTo,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { closeMessageInfo };
  }

  render() {
    return (
      <MessageInfo
        readBy={this.props.readBy}
        sentTo={this.props.sentTo}
        closeMessageInfo={this.props.closeMessageInfo}
      />
    );
  }
}

export const MessageInfoContainer = connectContainer<PublicProperties>(Container);
