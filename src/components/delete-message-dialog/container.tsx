import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { deleteMessage } from '../../store/messages';
import { DeleteMessageModal } from '.';
import { Payload as PayloadFetchMessages } from '../../store/messages/saga';

export interface PublicProperties {
  onClose: () => void;
}

export interface Properties extends PublicProperties {
  channelId: string;
  deleteMessageId: number;

  deleteMessage: (payload: PayloadFetchMessages) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      dialogs,
      chat: { activeConversationId },
    } = state;

    return {
      channelId: activeConversationId,
      deleteMessageId: dialogs.deleteMessageId,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      deleteMessage,
    };
  }

  delete = () => {
    this.props.deleteMessage({ channelId: this.props.channelId, messageId: this.props.deleteMessageId });
  };

  render() {
    return <DeleteMessageModal onDelete={this.delete} onClose={this.props.onClose} />;
  }
}
export const DeleteMessageContainer = connectContainer<PublicProperties>(Container);
