import React from 'react';

import { chat, Chat } from '../../lib/chat';
import { StatusIndicator } from './status-indicator';
import { connectContainer } from '../../store/redux-container';
import {
  Message,
  receiveNewMessage as receiveNewMessageAction,
  receiveDeleteMessage as receiveDeleteMessageAction,
} from '../../store/messages';
import { receiveIsReconnecting } from '../../store/chat';
import { RootState } from '../../store';
import { unreadCountUpdated } from '../../store/channels';
import { updateConnector } from '../../store/web3';
import { Connectors } from '../../lib/web3';
import { withContext as withAuthenticationContext } from '../../components/authentication/context';

export interface Properties {
  isLoading: boolean;
  chatAccessToken: string;
  chat?: Chat;
  reconnectStart: () => void;
  reconnectStop: () => void;
  receiveNewMessage: (channelId: string, message: Message) => void;
  receiveDeleteMessage: (channelId: string, messageId: number) => void;
  receiveUnreadCount: (channelId: string, unreadCount: number) => void;
  invalidChatAccessToken: () => void;
  userId: string;
  isReconnecting: boolean;
  context: {
    isAuthenticated: boolean;
  };
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState, props: Properties): Partial<Properties> {
    if (!props.context.isAuthenticated) return {};

    const {
      chat: {
        chatAccessToken: { value: chatAccessToken },
        isReconnecting,
      },
      authentication: {
        user: {
          data: { id: userId },
        },
      },
    } = state;

    return {
      chatAccessToken,
      isReconnecting,
      userId,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      reconnectStart: () => receiveIsReconnecting(true),
      reconnectStop: () => receiveIsReconnecting(false),
      receiveNewMessage: (channelId: string, message: Message) => receiveNewMessageAction({ channelId, message }),
      receiveUnreadCount: (channelId: string, unreadCount: number) => unreadCountUpdated({ channelId, unreadCount }),
      receiveDeleteMessage: (channelId: string, messageId: number) =>
        receiveDeleteMessageAction({ channelId, messageId }),
      invalidChatAccessToken: () => updateConnector(Connectors.None),
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

  componentDidUpdate(prevProps: Properties) {
    const {
      userId,
      chatAccessToken,
      context: { isAuthenticated },
    } = this.props;

    if (isAuthenticated && userId && chatAccessToken) {
      if (userId !== prevProps.userId || chatAccessToken !== prevProps.chatAccessToken) {
        this.startChatHandler(userId, chatAccessToken);
      }
    } else {
      this.chat.disconnect();
    }
  }

  async startChatHandler(userId, chatAccessToken) {
    const {
      reconnectStart,
      reconnectStop,
      receiveNewMessage,
      receiveDeleteMessage,
      receiveUnreadCount,
      invalidChatAccessToken,
    } = this.props;

    this.chat.initChat({
      reconnectStart,
      reconnectStop,
      receiveNewMessage,
      receiveDeleteMessage,
      receiveUnreadCount,
      invalidChatAccessToken,
    });

    await this.chat.connect(userId, chatAccessToken);
  }

  render() {
    return this.props.isReconnecting ? <StatusIndicator onForceReconnect={this.forceReconnect} /> : null;
  }
}

export const ChatConnect = withAuthenticationContext<{}>(connectContainer<{}>(Container));
