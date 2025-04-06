import React, { Fragment } from 'react';
import { Waypoint } from '../waypoint';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel, MediaType, EditMessageOptions } from '../../store/messages';
import InvertedScroll from '../inverted-scroll';
import { User } from '../../store/authentication/types';
import { User as ChannelMember } from '../../store/channels';
import { ParentMessage } from '../../lib/chat/types';
import { searchMentionableUsersForChannel } from '../../platform-apps/channels/util/api';
import { Message } from '../message';
import { AdminMessageContainer } from '../admin-message/container';
import { Payload as PayloadFetchMessages } from '../../store/messages/saga';
import './styles.scss';
import { ChatSkeleton } from './chat-skeleton';
import { createMessageGroups, filterAdminMessages, getMessageRenderProps } from './utils';
import { MessagesFetchState } from '../../store/channels';
import { bemClassName } from '../../lib/bem';

// Note: this is the component convention. Existing styles reference channel-view which
// is old and can be migrated to this component.
const cn = bemClassName('chat-view');

interface ChatMessageGroups {
  [date: string]: MessageModel[];
}

export interface Properties {
  id: string;
  name: string;
  messages: MessageModel[];
  mediaMessages: Map<string, MessageModel>;
  shouldRenderMessage: (message: MessageModel) => boolean;
  sortMessages: (messages: MessageModel[]) => MessageModel[];
  hasLoadedMessages: boolean;
  messagesFetchStatus: MessagesFetchState;
  otherMembers: ChannelMember[];
  onFetchMore: () => void;
  fetchMessages: (payload: PayloadFetchMessages) => void;
  user: User;
  deleteMessage: (messageId: string) => void;
  editMessage: (
    messageId: string,
    message: string,
    mentionedUserIds: string[],
    data?: Partial<EditMessageOptions>
  ) => void;
  onReply: ({ reply }: { reply: ParentMessage }) => void;
  onHiddenMessageInfoClick: () => void;
  className?: string;
  showSenderAvatar?: boolean;
  isOneOnOne: boolean;
  conversationErrorMessage: string;
  isSecondarySidekickOpen: boolean;
  toggleSecondarySidekick: () => void;
  openMessageInfo: (payload: { roomId: string; messageId: string }) => void;
  sendEmojiReaction: (messageId: string, key: string) => void;
  onReportUser: (payload: { reportedUserId: string }) => void;
  openLightbox: (payload: { media: any[]; startingIndex: number }) => void;
}

export interface State {
  rendered: boolean;
}

export class ChatView extends React.Component<Properties, State> {
  scrollContainerRef: React.RefObject<InvertedScroll>;
  state = { rendered: false };

  constructor(props) {
    super(props);
    this.scrollContainerRef = React.createRef();
  }

  componentDidMount(): void {
    this.setState({ rendered: true });
  }

  scrollToBottom = () => {
    if (this.scrollContainerRef.current) {
      this.scrollContainerRef.current.scrollToBottom();
    }
  };

  getMessagesByDay() {
    const filteredMessages = this.props.messages.filter(this.props.shouldRenderMessage);
    const sortedMessages = this.props.sortMessages(filteredMessages);
    return sortedMessages.reduce((prev, current) => {
      const createdAt = moment(current.createdAt);
      const startOfDay = createdAt.startOf('day').format();
      if (!prev[startOfDay]) {
        prev[startOfDay] = [];
      }
      prev[startOfDay].push(current);
      return prev;
    }, {} as ChatMessageGroups);
  }

  openLightbox = (media) => {
    const { messages, mediaMessages } = this.props;

    const lightboxMedia = messages
      .filter(this.props.shouldRenderMessage)
      .map((message) => message.media || mediaMessages.get(message.id)?.media)
      .filter((media) => {
        return media && [MediaType.Image].includes(media.type);
      })
      .reverse();

    const lightboxStartIndex = lightboxMedia.indexOf(media);

    this.props.openLightbox({ media: lightboxMedia, startingIndex: lightboxStartIndex });
  };

  openMessageInfo = (messageId: string) => {
    this.props.openMessageInfo({ roomId: this.props.id, messageId });

    if (!this.props.isSecondarySidekickOpen) {
      this.props.toggleSecondarySidekick();
    }
  };

  formatDayHeader(dateString: string): string {
    const date = moment(dateString);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');

    if (date.isSame(today, 'day')) {
      return 'Today';
    } else if (date.isSame(yesterday, 'day')) {
      return 'Yesterday';
    } else if (date.year() === today.year()) {
      return date.format('ddd, MMM D');
    } else {
      return date.format('MMM D, YYYY');
    }
  }

  isUserOwnerOfMessage(message: { sender: { userId: string } }) {
    return this.props.user && message?.sender && this.props.user.id === message.sender.userId;
  }

  renderMessageGroup(groupMessages: MessageModel[]) {
    return groupMessages.map((message, index) => {
      if (message.isAdmin) {
        return <AdminMessageContainer key={message.optimisticId || message.id} message={message} />;
      } else {
        const isUserOwner = this.isUserOwnerOfMessage(message);
        const isUserOwnerOfParentMessage = this.isUserOwnerOfMessage(message.parentMessage);
        const messageRenderProps = getMessageRenderProps(
          index,
          groupMessages.length,
          this.props.isOneOnOne,
          isUserOwner
        );
        const mediaMessage =
          this.props.mediaMessages.get(message.id) || this.props.mediaMessages.get(message.optimisticId);

        return (
          <div
            key={message.optimisticId || message.id}
            className={classNames('messages__message-row', {
              'messages__message-row--owner': isUserOwner,
            })}
          >
            <div {...cn('group-message', messageRenderProps.position)}>
              <Message
                className={classNames('messages__message', {
                  'messages__message--last-in-group': this.props.showSenderAvatar && index === groupMessages.length - 1,
                })}
                onImageClick={this.openLightbox}
                messageId={message.id}
                updatedAt={message.updatedAt}
                isOwner={isUserOwner}
                isHidden={message.isHidden}
                onDelete={this.props.deleteMessage}
                onEdit={this.props.editMessage}
                onReply={this.props.onReply}
                onReportUser={this.props.onReportUser}
                onInfo={this.openMessageInfo}
                parentMessageText={message.parentMessageText}
                parentSenderIsCurrentUser={isUserOwnerOfParentMessage}
                parentSenderFirstName={message.parentMessage?.sender?.firstName}
                parentSenderLastName={message.parentMessage?.sender?.lastName}
                parentMessageMedia={message.parentMessageMedia}
                getUsersForMentions={this.searchMentionableUsers}
                showSenderAvatar={this.props.showSenderAvatar}
                showTimestamp={messageRenderProps.showTimestamp}
                showAuthorName={messageRenderProps.showAuthorName}
                onHiddenMessageInfoClick={this.props.onHiddenMessageInfoClick}
                sendEmojiReaction={this.props.sendEmojiReaction}
                reactions={message.reactions}
                mediaMessage={mediaMessage}
                {...message}
              />
            </div>
          </div>
        );
      }
    });
  }

  renderDay(day: string, messagesByDay: ChatMessageGroups) {
    const groups = createMessageGroups(messagesByDay[day]);

    return (
      <Fragment key={day}>
        <div className='message__header'>
          <div className='message__header-date'>{this.formatDayHeader(day)}</div>
        </div>
        {groups.map((group) => this.renderMessageGroup(group)).flat()}
      </Fragment>
    );
  }

  renderMessages() {
    const messagesByDay = this.getMessagesByDay();
    const filteredMessagesByDay = filterAdminMessages(messagesByDay);
    const cn = bemClassName('messages');

    return (
      <div {...cn('container', this.state.rendered && 'rendered')}>
        {Object.keys(filteredMessagesByDay)
          .sort((a, b) => (a > b ? 1 : -1))
          .map((day) => {
            return this.renderDay(day, { [day]: filteredMessagesByDay[day] });
          })}
      </div>
    );
  }

  searchMentionableUsers = async (search: string) => {
    return await searchMentionableUsersForChannel(this.props.id, search, this.props.otherMembers);
  };

  get failureMessage() {
    if (this.props.hasLoadedMessages) {
      return 'Failed to load new messages.';
    }

    if (this.props.name) {
      return `Failed to load conversation with ${this.props.name}.`;
    } else {
      const otherMemberName = this.props.otherMembers[0]?.firstName;
      return `Failed to load your conversation with ${otherMemberName}.`;
    }
  }

  render() {
    return (
      <div className={classNames('channel-view', this.props.className)}>
        <InvertedScroll
          className='channel-view__inverted-scroll'
          isScrollbarHidden={this.props.isSecondarySidekickOpen}
          ref={this.scrollContainerRef}
        >
          <div className='channel-view__main'>
            {this.props.hasLoadedMessages && this.props.messagesFetchStatus === MessagesFetchState.MORE_IN_PROGRESS && (
              <div {...cn('scroll-skeleton')}>
                <ChatSkeleton conversationId={this.props.id} short />
              </div>
            )}
            {this.props.messages.length > 0 && this.props.messagesFetchStatus === MessagesFetchState.SUCCESS && (
              <div {...cn('infinite-scroll-waypoint')}>
                <Waypoint onEnter={this.props.onFetchMore} />
              </div>
            )}
            {!this.props.hasLoadedMessages && this.props.messagesFetchStatus !== MessagesFetchState.FAILED && (
              <ChatSkeleton conversationId={this.props.id} />
            )}
            {this.props.messages.length > 0 && this.renderMessages()}
          </div>

          {this.props.messagesFetchStatus === MessagesFetchState.FAILED && (
            <div {...cn('failure-message')}>
              {this.failureMessage}&nbsp;
              <span
                {...cn('try-reload')}
                onClick={() => {
                  this.props.fetchMessages({ channelId: this.props.id });
                }}
              >
                Try Reload
              </span>
            </div>
          )}

          {this.props.conversationErrorMessage && <div {...cn('error')}>{this.props.conversationErrorMessage}</div>}
        </InvertedScroll>
      </div>
    );
  }
}
