import React from 'react';

import { chat, Chat } from '../../lib/chat';
import { StatusIndicator } from './status-indicator';
import { connectContainer } from '../../store/redux-container';
import { initChat } from '../../store/chat';
import { RootState } from '../../store/reducer';
import { updateConnector } from '../../store/web3';
import { Connectors } from '../../lib/web3';
import { withContext as withAuthenticationContext } from '../../components/authentication/context';

export interface Properties {
  isLoading: boolean;
  chatAccessToken: string;
  chat?: Chat;
  invalidChatAccessToken: () => void;
  initChat: () => void;
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
      invalidChatAccessToken: () => updateConnector(Connectors.None),
      initChat,
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
        this.startChatHandler();
      }
    } else {
      this.chat.disconnect();
    }
  }

  async startChatHandler() {
    this.props.initChat();
  }

  render() {
    return this.props.isReconnecting ? <StatusIndicator onForceReconnect={this.forceReconnect} /> : null;
  }
}

export const ChatConnect = withAuthenticationContext<{}>(connectContainer<{}>(Container));
