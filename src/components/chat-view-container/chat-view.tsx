import React, { RefObject } from 'react';
import { Waypoint } from 'react-waypoint';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel, MediaType, EditMessageOptions } from '../../store/messages';
import InvertedScroll from '../inverted-scroll';
import IndicatorMessage from '../indicator-message';
import { Lightbox } from '@zer0-os/zos-component-library';
import { getProvider } from '../../lib/cloudinary/provider';
import { User } from '../../store/authentication/types';
import { MessageInput } from '../message-input/container';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { Button as ConnectButton } from '../authentication/button';
import { Button as ComponentButton } from '@zer0-os/zos-component-library';
import { Media } from '../message-input/utils';
import { ParentMessage } from '../../lib/chat/types';
import { searchMentionableUsersForChannel } from '../../platform-apps/channels/util/api';
import { Message } from '../message';
import { AdminMessageContainer } from '../admin-message/container';

import './styles.scss';
import { ChatSkeleton } from './chat-skeleton';
import { createMessageGroups } from './utils';

interface ChatMessageGroups {
  [date: string]: MessageModel[];
}

export interface Properties {
  id: string;
  name: string;
  messages: MessageModel[];
  hasLoadedMessages: boolean;
  onFetchMore: () => void;
  user: User;
  hasJoined: boolean;
  sendMessage: (message: string, mentionedUserIds: string[], media: Media[]) => void;
  deleteMessage: (messageId: number) => void;
  editMessage: (
    messageId: number,
    message: string,
    mentionedUserIds: string[],
    data?: Partial<EditMessageOptions>
  ) => void;
  onRemove?: () => void;
  onReply: (reply: ParentMessage) => void;
  joinChannel: () => void;
  resetCountNewMessage: () => void;
  countNewMessages: number;
  className?: string;
  reply?: null | ParentMessage;
  onMessageInputRendered: (ref: RefObject<HTMLTextAreaElement>) => void;
  isDirectMessage: boolean;
  showSenderAvatar?: boolean;
  isMessengerFullScreen: boolean;
}

export interface State {
  lightboxMedia: any[];
  lightboxStartIndex: number;
  isLightboxOpen: boolean;
}

export class ChatView extends React.Component<Properties, State> {
  bottomRef;
  constructor(props) {
    super(props);
    this.bottomRef = React.createRef();
  }
  state = { lightboxMedia: [], lightboxStartIndex: 0, isLightboxOpen: false };

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

  closeIndicator = () => {
    this.props.resetCountNewMessage();
    this.bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  isShowIndicator = (): boolean => {
    if (this.props.countNewMessages > 0 && this.bottomRef.current) {
      const { bottom } = this.bottomRef.current?.getBoundingClientRect();
      if (window.innerHeight + 50 < bottom) {
        return true;
      }
      this.props.resetCountNewMessage();
      return false;
    }
    return false;
  };

  isUserOwnerOfMessage(message: MessageModel) {
    // eslint-disable-next-line eqeqeq
    return this.props.user && message.sender && this.props.user.id == message.sender.userId;
  }

  renderMessageGroup(allMessages) {
    return allMessages.map((message, index) => {
      if (message.isAdmin) {
        return <AdminMessageContainer key={message.id} message={message} />;
      } else {
        return (
          <div
            key={message.id}
            className={classNames('messages__message-row', {
              'messages__message-row--owner': this.isUserOwnerOfMessage(message),
            })}
          >
            <Message
              className={classNames('messages__message', {
                'messages__message--last-in-group': this.props.showSenderAvatar && index === allMessages.length - 1,
              })}
              onImageClick={this.openLightbox}
              messageId={message.id}
              updatedAt={message.updatedAt}
              isOwner={this.isUserOwnerOfMessage(message)}
              onDelete={this.props.deleteMessage}
              onEdit={this.props.editMessage}
              onReply={this.props.onReply}
              parentMessageText={message.parentMessageText}
              getUsersForMentions={this.searchMentionableUsers}
              showSenderAvatar={this.props.showSenderAvatar}
              {...message}
            />
          </div>
        );
      }
    });
  }

  renderDay(day: string, messagesByDay: ChatMessageGroups) {
    const groups = createMessageGroups(messagesByDay[day]);

    return (
      <div className='messages' key={day}>
        <div className='message__header'>
          <div className='message__header-date'>{this.formatDayHeader(day)}</div>
        </div>
        {groups.map((group, index) => {
          return (
            <div key={index} className='message__group'>
              {this.renderMessageGroup(group)}
            </div>
          );
        })}
      </div>
    );
  }

  renderMessages() {
    const messagesByDay = this.getMessagesByDay();
    const groupDays = Object.keys(messagesByDay).sort((a, b) => (a > b ? 1 : -1));

    return (
      <div className='messages__container'>{groupDays.map((day: string) => this.renderDay(day, messagesByDay))}</div>
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
    return await searchMentionableUsersForChannel(this.props.id, search);
  };

  render() {
    const { isLightboxOpen, lightboxMedia, lightboxStartIndex } = this.state;
    const { hasJoined: isMemberOfChannel } = this.props;

    return (
      <div
        className={classNames('channel-view', this.props.className, {
          'channel-view__fullscreen': this.props.isMessengerFullScreen,
        })}
      >
        {this.isShowIndicator() && (
          <IndicatorMessage countNewMessages={this.props.countNewMessages} closeIndicator={this.closeIndicator} />
        )}
        {isLightboxOpen && (
          <Lightbox
            provider={getProvider()}
            items={lightboxMedia}
            startingIndex={lightboxStartIndex}
            onClose={this.closeLightBox}
          />
        )}
        <InvertedScroll className='channel-view__inverted-scroll'>
          <div className='channel-view__main'>
            {!this.props.isDirectMessage && (
              <div className='channel-view__name'>
                <h1>Welcome to #{this.props.name}</h1>
                <span>This is the start of the channel.</span>
              </div>
            )}
            {this.props.messages.length > 0 && <Waypoint onEnter={this.props.onFetchMore} />}
            {this.props.messages.length > 0 && this.renderMessages()}
            {!this.props.hasLoadedMessages && <ChatSkeleton conversationId={this.props.id} />}
            <div ref={this.bottomRef} />
          </div>
        </InvertedScroll>
        <IfAuthenticated showChildren>
          {isMemberOfChannel && (
            <MessageInput
              onMessageInputRendered={this.props.onMessageInputRendered}
              id={this.props.id}
              onSubmit={this.props.sendMessage}
              getUsersForMentions={this.searchMentionableUsers}
              reply={this.props.reply}
              onRemoveReply={this.props.onRemove}
            />
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
