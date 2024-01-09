import React, { Fragment } from 'react';
import { Waypoint } from 'react-waypoint';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel, MediaType, EditMessageOptions } from '../../store/messages';
import InvertedScroll from '../inverted-scroll';
import { Lightbox } from '@zer0-os/zos-component-library';
import { User } from '../../store/authentication/types';
import { User as ChannelMember } from '../../store/channels';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { Button as ConnectButton } from '../authentication/button';
import { Button as ComponentButton } from '@zer0-os/zos-component-library';
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
  hasLoadedMessages: boolean;
  messagesFetchStatus: MessagesFetchState;
  otherMembers: ChannelMember[];
  onFetchMore: () => void;
  fetchMessages: (payload: PayloadFetchMessages) => void;
  user: User;
  hasJoined: boolean;
  deleteMessage: (messageId: number) => void;
  editMessage: (
    messageId: number,
    message: string,
    mentionedUserIds: string[],
    data?: Partial<EditMessageOptions>
  ) => void;
  onReply: ({ reply }: { reply: ParentMessage }) => void;
  joinChannel: () => void;
  className?: string;
  isDirectMessage: boolean;
  showSenderAvatar?: boolean;
  isOneOnOne: boolean;
  conversationErrorMessage: string;
}

export interface State {
  lightboxMedia: any[];
  lightboxStartIndex: number;
  isLightboxOpen: boolean;
}

export class ChatView extends React.Component<Properties, State> {
  scrollContainerRef: React.RefObject<InvertedScroll>;
  state = { lightboxMedia: [], lightboxStartIndex: 0, isLightboxOpen: false };

  constructor(props) {
    super(props);
    this.scrollContainerRef = React.createRef();
  }

  scrollToBottom = () => {
    if (this.scrollContainerRef.current) {
      this.scrollContainerRef.current.scrollToBottom();
    }
  };

  getMessagesByDay() {
    return this.props.messages.reduce((prev, current) => {
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
    const { messages } = this.props;

    const lightboxMedia = messages
      .filter((message) => !!message.media && [MediaType.Image].includes(message.media.type))
      .map((m) => m.media);

    const lightboxStartIndex = lightboxMedia.indexOf(media);

    this.setState({ lightboxMedia, lightboxStartIndex, isLightboxOpen: true });
  };

  closeLightBox = () => {
    this.setState({ isLightboxOpen: false });
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

  isUserOwnerOfMessage(message: MessageModel) {
    // eslint-disable-next-line eqeqeq
    return this.props.user && message?.sender && this.props.user.id == message.sender.userId;
  }

  renderMessageGroup(groupMessages) {
    return groupMessages.map((message, index) => {
      if (message.isAdmin) {
        return <AdminMessageContainer key={message.optimisticId || message.id} message={message} />;
      } else {
        const messageRenderProps = getMessageRenderProps(
          index,
          groupMessages.length,
          this.props.isOneOnOne,
          this.isUserOwnerOfMessage(message)
        );
        return (
          <div
            key={message.optimisticId || message.id}
            className={classNames('messages__message-row', {
              'messages__message-row--owner': this.isUserOwnerOfMessage(message),
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
                isOwner={this.isUserOwnerOfMessage(message)}
                onDelete={this.props.deleteMessage}
                onEdit={this.props.editMessage}
                onReply={this.props.onReply}
                parentMessageText={message.parentMessageText}
                parentSenderIsCurrentUser={this.isUserOwnerOfMessage(message.parentMessage)}
                parentSenderFirstName={message.parentMessage?.sender?.firstName}
                parentSenderLastName={message.parentMessage?.sender?.lastName}
                getUsersForMentions={this.searchMentionableUsers}
                showSenderAvatar={this.props.showSenderAvatar}
                showTimestamp={messageRenderProps.showTimestamp}
                showAuthorName={messageRenderProps.showAuthorName}
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

    return (
      <div className='messages__container'>
        {Object.keys(filteredMessagesByDay)
          .sort((a, b) => (a > b ? 1 : -1))
          .map((day) => {
            return this.renderDay(day, { [day]: filteredMessagesByDay[day] });
          })}
      </div>
    );
  }

  renderJoinButton() {
    return (
      <div onClick={this.props.joinChannel} className={classNames(this.props.className, 'channel-view__join-wrapper')}>
        <ComponentButton>Join Channel</ComponentButton>
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
    const { isLightboxOpen, lightboxMedia, lightboxStartIndex } = this.state;
    const { hasJoined: isMemberOfChannel } = this.props;

    return (
      <div className={classNames('channel-view', this.props.className)}>
        {isLightboxOpen && (
          <Lightbox
            // since we are displaying images from a local blob url (instead of a cloudinary url),
            // we need to provide a custom provider which just returns the src directly.
            provider={{
              fitWithinBox: () => {},
              getSource: ({ src }) => src,
            }}
            items={lightboxMedia}
            startingIndex={lightboxStartIndex}
            onClose={this.closeLightBox}
          />
        )}
        <InvertedScroll className='channel-view__inverted-scroll' ref={this.scrollContainerRef}>
          <div className='channel-view__main'>
            {!this.props.isDirectMessage && (
              <div className='channel-view__name'>
                <h1>Welcome to #{this.props.name}</h1>
                <span>This is the start of the channel.</span>
              </div>
            )}
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
            {this.props.messages.length > 0 && this.renderMessages()}
            {!this.props.hasLoadedMessages && this.props.messagesFetchStatus !== MessagesFetchState.FAILED && (
              <ChatSkeleton conversationId={this.props.id} />
            )}
          </div>
        </InvertedScroll>

        {this.props.messagesFetchStatus === MessagesFetchState.FAILED && (
          <div className='channel-view__failure-message'>
            {this.failureMessage}&nbsp;
            <div
              className='channel-view__try-reload'
              onClick={() => {
                this.props.fetchMessages({ channelId: this.props.id });
              }}
            >
              Try Reload
            </div>
          </div>
        )}

        {/* i think we can remove the entire code below */}
        <IfAuthenticated showChildren>
          {isMemberOfChannel && (
            <>
              {this.props.conversationErrorMessage && <div {...cn('error')}>{this.props.conversationErrorMessage}</div>}
            </>
          )}
          {!isMemberOfChannel && this.renderJoinButton()}
        </IfAuthenticated>
        <IfAuthenticated hideChildren>
          <ConnectButton className='authentication__connect-wrapper--with-space' />
        </IfAuthenticated>
      </div>
    );
  }
}
