import React from 'react';
import { Waypoint } from 'react-waypoint';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel, MediaType } from '../../store/messages';
import { Message } from './message';
import InvertedScroll from '../../components/inverted-scroll';
import IndicatorMessage from '../../components/indicator-message';
import { Lightbox } from '@zer0-os/zos-component-library';
import { provider as cloudinaryProvider } from '../../lib/cloudinary/provider';
import { Member, User } from '../../store/authentication/types';
import { MessageInput } from '../../components/message-input';

interface ChatMessageGroups {
  [date: string]: MessageModel[];
}

export interface Properties {
  name: string;
  messages: MessageModel[];
  onFetchMore: () => void;
  user: User;
  sendMessage: (message: string, mentionedUsers: string[]) => void;
  resetCountNewMessage: () => void;
  countNewMessages: number;
  users: Member[];
}
export interface State {
  lightboxMedia: any[];
  lightboxStartIndex: number;
  isLightboxOpen: boolean;
}

export class ChannelView extends React.Component<Properties, State> {
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

    return date.calendar(null, {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: '[Next] dddd',
      lastDay: '[Yesterday]',
      lastWeek: 'dddd',
      sameElse: 'MMM D, YYYY',
    });
  }

  closeIndicator = () => {
    this.props.resetCountNewMessage();
    this.bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  renderDay(day: string, messagesByDay: ChatMessageGroups) {
    const allMessages = messagesByDay[day];

    return (
      <div
        className='messages'
        key={day}
      >
        <div className='message__header'>
          <div className='message__header-date'>{this.formatDayHeader(day)}</div>
        </div>
        {allMessages.map((message, index) => {
          const isFirstFromUser = index === 0 || message.sender.userId !== allMessages[index - 1].sender.userId;
          const isUserOwnerOfTheMessage =
            // eslint-disable-next-line eqeqeq
            this.props.user && message.sender && this.props.user.id == message.sender.userId;

          return (
            <Message
              className={classNames('messages__message', { 'messages__message--first-in-group': isFirstFromUser })}
              onImageClick={this.openLightbox}
              key={message.id}
              isOwner={isUserOwnerOfTheMessage}
              {...message}
            />
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

  renderChatWindow() {
    if (!this.props.user) {
      return null;
    }

    return (
      <MessageInput
        className='message-input__textarea'
        placeholder='Speak your truth...'
        isUserConnected={true}
        onSubmit={this.props.sendMessage}
        users={this.props.users}
      />
    );
  }

  render() {
    const { isLightboxOpen, lightboxMedia, lightboxStartIndex } = this.state;

    return (
      <div className='channel-view'>
        {this.props.countNewMessages > 0 && (
          <IndicatorMessage
            countNewMessages={this.props.countNewMessages}
            closeIndicator={this.closeIndicator}
          />
        )}
        {isLightboxOpen && (
          <Lightbox
            provider={cloudinaryProvider}
            items={lightboxMedia}
            startingIndex={lightboxStartIndex}
            onClose={this.closeLightBox}
          />
        )}
        <InvertedScroll className='channel-view__inverted-scroll'>
          <div className='channel-view__name'>
            <h1>Welcome to #{this.props.name}</h1>
            <span>This is the start of the channel.</span>
          </div>
          {this.props.messages.length > 0 && <Waypoint onEnter={this.props.onFetchMore} />}
          {this.props.messages.length > 0 && this.renderMessages()}
          {this.renderChatWindow()}
          <div ref={this.bottomRef} />
        </InvertedScroll>
      </div>
    );
  }
}
