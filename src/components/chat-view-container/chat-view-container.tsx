import React from 'react';
import classNames from 'classnames';
import { RootState } from '../../store/reducer';

import { connectContainer } from '../../store/redux-container';
import {
  fetch as fetchMessages,
  editMessage,
  Message,
  EditMessageOptions,
  loadAttachmentDetails,
  Media,
  sendEmojiReaction,
  AdminMessageType,
} from '../../store/messages';
import { Channel, ConversationStatus, denormalize, onReply } from '../../store/channels';
import { ChatView } from './chat-view';
import { AuthenticationState } from '../../store/authentication/types';
import { EditPayload, Payload as PayloadFetchMessages } from '../../store/messages/saga';
import { openBackupDialog } from '../../store/matrix';
import { ParentMessage } from '../../lib/chat/types';
import { openDeleteMessage, openLightbox } from '../../store/dialogs';
import { openMessageInfo } from '../../store/message-info';
import { toggleSecondarySidekick } from '../../store/group-management';
import { processMessages } from './utils';
import { openReportUserModal } from '../../store/report-user';
import { compareDatesAsc } from '../../lib/date';

export interface Properties extends PublicProperties {
  channel: Channel;
  fetchMessages: (payload: PayloadFetchMessages) => void;
  user: AuthenticationState['user'];
  editMessage: (payload: EditPayload) => void;
  onReply: ({ reply }: { reply: ParentMessage }) => void;
  openBackupDialog: () => void;
  activeConversationId?: string;
  context: {
    isAuthenticated: boolean;
  };
  isSecondarySidekickOpen: boolean;
  openDeleteMessage: (messageId: string) => void;
  toggleSecondarySidekick: () => void;
  openMessageInfo: (payload: { roomId: string; messageId: string }) => void;
  loadAttachmentDetails: (payload: { media: Media; messageId: string }) => void;
  sendEmojiReaction: (payload: { roomId: string; messageId: string; key: string }) => void;
  openReportUserModal: (payload: { reportedUserId: string }) => void;
  openLightbox: (payload: { media: any[]; startingIndex: number }) => void;
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
      groupManagement: { isSecondarySidekickOpen },
    } = state;

    return {
      channel,
      user,
      activeConversationId,
      isSecondarySidekickOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchMessages,
      editMessage,
      onReply,
      openBackupDialog,
      openDeleteMessage,
      openMessageInfo,
      toggleSecondarySidekick,
      loadAttachmentDetails,
      sendEmojiReaction,
      openReportUserModal,
      openLightbox,
    };
  }

  componentDidMount() {
    const { channelId, channel } = this.props;
    if (channelId && !channel.hasLoadedMessages) {
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

  handleDeleteMessage = (messageId: string): void => {
    const { channelId } = this.props;
    if (channelId && messageId) {
      this.props.openDeleteMessage(messageId);
    }
  };

  handleEditMessage = (
    messageId: string,
    message: string,
    mentionedUserIds: string[],
    data?: Partial<EditMessageOptions>
  ): void => {
    const { channelId } = this.props;
    if (channelId && messageId) {
      this.props.editMessage({ channelId, messageId, message, mentionedUserIds, data });
    }
  };

  sendEmojiReaction = async (messageId: string, key: string) => {
    try {
      await this.props.sendEmojiReaction({ roomId: this.props.channelId, messageId, key });
    } catch (error) {
      console.error('Failed to send emoji reaction:', error);
    }
  };

  get messages() {
    if (!this.props.channel?.messages) return { messages: [], mediaMessages: new Map() };
    return processMessages(this.props.channel.messages);
  }

  shouldRenderMessage(message: Message) {
    return (
      !message.rootMessageId && !message.isPost && (!message.admin || message.admin?.type !== AdminMessageType.REACTION)
    );
  }

  sortMessages(messages: Message[]) {
    return messages.sort((a, b) => compareDatesAsc(a.createdAt.toString(), b.createdAt.toString()));
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

  onReportUser = ({ reportedUserId }: { reportedUserId: string }) => {
    this.props.openReportUserModal({ reportedUserId });
  };

  render() {
    if (!this.props.channel) return null;

    return (
      <>
        <ChatView
          className={classNames(this.props.className)}
          id={this.channel.id}
          name={this.channel.name}
          messages={this.messages.messages}
          mediaMessages={this.messages.mediaMessages}
          shouldRenderMessage={this.shouldRenderMessage}
          sortMessages={this.sortMessages}
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
          onReportUser={this.onReportUser}
          conversationErrorMessage={this.conversationErrorMessage}
          onHiddenMessageInfoClick={this.props.openBackupDialog}
          ref={this.chatViewRef}
          isSecondarySidekickOpen={this.props.isSecondarySidekickOpen}
          toggleSecondarySidekick={this.props.toggleSecondarySidekick}
          openMessageInfo={this.props.openMessageInfo}
          loadAttachmentDetails={this.props.loadAttachmentDetails}
          sendEmojiReaction={this.sendEmojiReaction}
          openLightbox={this.props.openLightbox}
        />
      </>
    );
  }
}

export const ChatViewContainer = connectContainer<PublicProperties>(Container);
