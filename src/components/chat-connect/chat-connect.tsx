import React from 'react';

import { chat, Chat } from '../../lib/chat';
import { StatusIndicator } from './status-indicator';
import { connectContainer } from '../../store/redux-container';
import {
  Message,
  receiveNewMessage as receiveNewMessageAction,
  receiveDeleteMessage as receiveDeleteMessageAction,
} from '../../store/messages';
import { fetchChatAccessToken, receiveIsReconnecting } from '../../store/chat';
import { RootState } from '../../store';
import { UserPayload } from '../../store/authentication/types';

export interface Properties {
  isLoading: boolean;
  chatAccessToken: string;
  chat?: Chat;
  reconnectStart: () => void;
  reconnectStop: () => void;
  receiveNewMessage: (channelId: string, message: Message) => void;
  receiveDeleteMessage: (channelId: string, messageId: number) => void;
  fetchChatAccessToken: () => void;
  user: UserPayload;
  isReconnecting: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { chatAccessToken, isReconnecting },
      authentication: { user },
    } = state;

    return {
      isLoading: chatAccessToken.isLoading,
      chatAccessToken: chatAccessToken.value,
      user,
      isReconnecting,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      reconnectStart: () => receiveIsReconnecting(true),
      reconnectStop: () => receiveIsReconnecting(false),
      receiveNewMessage: (channelId: string, message: Message) => receiveNewMessageAction({ channelId, message }),
      receiveDeleteMessage: (channelId: string, messageId: number) =>
        receiveDeleteMessageAction({ channelId, messageId }),
      fetchChatAccessToken,
    };
  }

  chat: Chat;

  constructor(props) {
    super(props);

    this.chat = props.chat || chat;
  }

  forceReconnect = () => {
    this.chat.reconnect();
  };

  componentDidMount() {
    this.props.fetchChatAccessToken();
  }

  componentDidUpdate(prevProps: Properties) {
    if (prevProps.isLoading === true && this.props.isLoading === false && this.props.chatAccessToken !== '') {
      this.startChatHandler();
    }
  }

  async startChatHandler() {
    const userId = this.props.user.data.id;
    await this.chat.setUserId(userId, this.props.chatAccessToken);

    const { reconnectStart, reconnectStop, receiveNewMessage, receiveDeleteMessage } = this.props;

    this.chat.initChat({
      reconnectStart,
      reconnectStop,
      receiveNewMessage,
      receiveDeleteMessage,
    });
  }

  render() {
    return this.props.isReconnecting ? <StatusIndicator onForceReconnect={this.forceReconnect} /> : null;
  }
}

export const ChatConnect = connectContainer<{}>(Container);
