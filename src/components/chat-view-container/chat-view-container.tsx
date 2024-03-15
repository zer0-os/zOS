import React from 'react';
import classNames from 'classnames';
import { RootState } from '../../store/reducer';

import { connectContainer } from '../../store/redux-container';
import { fetch as fetchMessages, deleteMessage, editMessage, Message, EditMessageOptions } from '../../store/messages';
import { Channel, ConversationStatus, denormalize, onReply } from '../../store/channels';
import { ChatView } from './chat-view';
import { AuthenticationState } from '../../store/authentication/types';
import { EditPayload, Payload as PayloadFetchMessages } from '../../store/messages/saga';
import { openBackupDialog } from '../../store/matrix';
import { ParentMessage } from '../../lib/chat/types';
import { compareDatesAsc } from '../../lib/date';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (payload: PayloadFetchMessages) => void;
  user: AuthenticationState['user'];
  deleteMessage: (payload: PayloadFetchMessages) => void;
  editMessage: (payload: EditPayload) => void;
  onReply: ({ reply }: { reply: ParentMessage }) => void;
  openBackupDialog: () => void;
  activeConversationId?: string;
  context: {
    isAuthenticated: boolean;
  };
}

interface PublicProperties {
  channelId: string;
  className?: string;
  showSenderAvatar?: boolean;
  ref?: any;
}

export class Container extends React.Component<Properties> {
  chatViewRef: React.RefObject<any>;

  constructor(props) {
    super(props);
    this.chatViewRef = React.createRef();
  }

  static mapState(state: RootState, props: PublicProperties): Partial<Properties> {
    const channel = denormalize(props.channelId, state) || null;
    const {
      authentication: { user },
      chat: { activeConversationId },
    } = state;

    return {
      channel,
      user,
      activeConversationId,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchMessages,
      deleteMessage,
      editMessage,
      onReply,
      openBackupDialog,
    };
  }

  componentDidMount() {
    const { channelId } = this.props;
    if (channelId) {
      this.props.fetchMessages({ channelId });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const { channelId } = this.props;

    if (channelId && channelId !== prevProps.channelId) {
      this.props.fetchMessages({ channelId });
      this.setState({ reply: null });
    }

    if (channelId && prevProps.user.data === null && this.props.user.data !== null) {
      this.props.fetchMessages({ channelId });
    }
  }

  scrollToBottom = (): void => {
    if (this.chatViewRef?.current) {
      this.chatViewRef.current.scrollToBottom();
    }
  };

  getOldestTimestamp(messages: Message[] = []): number {
    return messages.reduce((previousTimestamp, message: any) => {
      return message.createdAt < previousTimestamp ? message.createdAt : previousTimestamp;
    }, Date.now());
  }

  get channel(): Channel {
    return this.props.channel || ({} as Channel);
  }

  fetchMore = (): void => {
    const { channelId, channel } = this.props;

    if (channel.hasMore) {
      const referenceTimestamp = this.getOldestTimestamp(channel.messages);

      this.props.fetchMessages({ channelId, referenceTimestamp });
    }
  };

  handleDeleteMessage = (messageId: number): void => {
    const { channelId } = this.props;
    if (channelId && messageId) {
      this.props.deleteMessage({ channelId, messageId });
    }
  };

  handleEditMessage = (
    messageId: number,
    message: string,
    mentionedUserIds: string[],
    data?: Partial<EditMessageOptions>
  ): void => {
    const { channelId } = this.props;
    if (channelId && messageId) {
      this.props.editMessage({ channelId, messageId, message, mentionedUserIds, data });
    }
  };

  get messages() {
    const messagesById = {};
    const messages = [];
    // Assumption is that messages are already ordered by date and that
    // the "child" message will always come after the "parent" message.
    (this.channel?.messages || []).forEach((m) => {
      if (m.rootMessageId && messagesById[m.rootMessageId]) {
        messagesById[m.rootMessageId].media = m.media;
      } else {
        // Hmm... not sure how we ended up with integers as our message ids. For now, just cast to a string.
        messagesById[m.id.toString()] = m;
        if (m.id.toString() !== m.optimisticId) {
          messagesById[m.optimisticId] = m;
        }
        messages.push(m);
      }
    });

    return messages.sort((a, b) => compareDatesAsc(a.createdAt, b.createdAt));
  }

  get sendDisabledMessage() {
    if (this.props.channel.conversationStatus === ConversationStatus.CREATED) {
      return '';
    }

    let reference = ' with the group';
    if (this.props.channel.name) {
      reference = ` with ${this.props.channel.name}`;
    } else if (this.isOneOnOne) {
      const otherMember = this.props.channel.otherMembers[0];
      reference = ` with ${otherMember.firstName} ${otherMember.lastName}`;
    }

    return `We're connecting you${reference}. Try again in a few seconds.`;
  }

  get conversationErrorMessage() {
    if (this.props.channel.conversationStatus !== ConversationStatus.ERROR) {
      return '';
    }

    let reference = 'the group';
    if (this.props.channel.name) {
      reference = `${this.props.channel.name}`;
    } else if (this.isOneOnOne) {
      const otherMember = this.props.channel.otherMembers[0];
      reference = `${otherMember.firstName} ${otherMember.lastName}`;
    }

    return `Sorry! We couldn't connect you with ${reference}. Please refresh and try again.`;
  }

  get isOneOnOne() {
    return this.props.channel?.isOneOnOne;
  }

  render() {
    if (!this.props.channel) return null;

    return (
      <>
        <ChatView
          className={classNames(this.props.className)}
          id={this.channel.id}
          name={this.channel.name}
          messages={this.messages}
          messagesFetchStatus={this.channel.messagesFetchStatus}
          otherMembers={this.channel.otherMembers}
          hasLoadedMessages={this.channel.hasLoadedMessages ?? false}
          onFetchMore={this.fetchMore}
          fetchMessages={this.props.fetchMessages}
          user={this.props.user.data}
          deleteMessage={this.handleDeleteMessage}
          editMessage={this.handleEditMessage}
          showSenderAvatar={this.props.showSenderAvatar}
          isOneOnOne={this.isOneOnOne}
          onReply={this.props.onReply}
          conversationErrorMessage={this.conversationErrorMessage}
          onHiddenMessageInfoClick={this.props.openBackupDialog}
          ref={this.chatViewRef}
        />
      </>
    );
  }
}

export const ChatViewContainer = connectContainer<PublicProperties>(Container);
