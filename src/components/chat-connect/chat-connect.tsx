import React from 'react';

import { chat, Chat } from '../../lib/chat';
import { StatusIndicator } from './status-indicator';
import { connectContainer } from '../../store/redux-container';
import { receiveDeleteMessage as receiveDeleteMessageAction } from '../../store/messages';
import { initChat, receiveIsReconnecting } from '../../store/chat';
import { startChannelsAndConversationsAutoRefresh } from '../../store/channels-list';
import { RootState } from '../../store/reducer';
import { unreadCountUpdated } from '../../store/channels';
import { updateConnector } from '../../store/web3';
import { Connectors } from '../../lib/web3';
import { withContext as withAuthenticationContext } from '../../components/authentication/context';

export interface Properties {
  isLoading: boolean;
  chatAccessToken: string;
  chat?: Chat;
  receiveIsReconnecting: (payload: boolean) => void;
  startChannelsAndConversationsAutoRefresh: () => void;
  receiveDeleteMessage: (channelId: string, messageId: number) => void;
  receiveUnreadCount: (channelId: string, unreadCount: number) => void;
  invalidChatAccessToken: () => void;
  initChat: (config: any) => void;
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
      receiveIsReconnecting,
      startChannelsAndConversationsAutoRefresh,
      receiveUnreadCount: (channelId: string, unreadCount: number) => unreadCountUpdated({ channelId, unreadCount }),
      receiveDeleteMessage: (channelId: string, messageId: number) =>
        receiveDeleteMessageAction({ channelId, messageId }),
      invalidChatAccessToken: () => updateConnector(Connectors.None),
      initChat,
    };
  }

  chat: Chat;

  constructor(props) {
    super(props);

    this.chat = props.chat || chat;
  }

  reconnectStart = () => {
    console.log('reconnect start event?');
    this.props.receiveIsReconnecting(true);
  };

  reconnectStop = () => {
    console.log('reconnect stop event?');
    this.props.receiveIsReconnecting(false);
    // after reconnecting fetch (latest) channels and conversations *immediately*.
    // (instead of waiting for the "regular refresh interval to kick in")
    console.log('forcing reconnect');
    this.props.startChannelsAndConversationsAutoRefresh();
  };

  forceReconnect = () => {
    console.log('forcing reconnect');
    this.chat.reconnect();
  };

  componentDidUpdate(prevProps: Properties) {
    console.log('did update?');
    const {
      userId,
      chatAccessToken,
      context: { isAuthenticated },
    } = this.props;

    console.log('checking first condition', isAuthenticated, userId, chatAccessToken);
    if (isAuthenticated && userId && chatAccessToken) {
      console.log('second condition', userId !== prevProps.userId, chatAccessToken !== prevProps.chatAccessToken);
      if (userId !== prevProps.userId || chatAccessToken !== prevProps.chatAccessToken) {
        console.log('starting chat');
        this.startChatHandler(userId, chatAccessToken);
      }
    } else {
      console.log('we are disconnecting');
      this.chat.disconnect();
    }
  }

  async startChatHandler(userId, chatAccessToken) {
    console.log('starting chat handler');
    const { receiveDeleteMessage, receiveUnreadCount, invalidChatAccessToken } = this.props;

    const reconnectStop = this.reconnectStop;
    const reconnectStart = this.reconnectStart;

    // this.chat.initChat({
    //   reconnectStart,
    //   reconnectStop,
    //   receiveDeleteMessage,
    //   receiveUnreadCount,
    //   invalidChatAccessToken,
    // });

    // await this.chat.connect(userId, chatAccessToken);
    this.props.initChat({
      config: {
        reconnectStart,
        reconnectStop,
        receiveDeleteMessage,
        receiveUnreadCount,
        invalidChatAccessToken,
      },
    });
  }

  render() {
    console.log('rendeirng the chat connector?');
    return this.props.isReconnecting ? <StatusIndicator onForceReconnect={this.forceReconnect} /> : null;
  }
}

export const ChatConnect = withAuthenticationContext<{}>(connectContainer<{}>(Container));
