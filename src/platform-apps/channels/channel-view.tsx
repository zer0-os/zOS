import React from 'react';
import { Waypoint } from 'react-waypoint';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel } from '../../store/messages';
import { Message } from './message';
import InvertedScroll from '../../components/inverted-scroll';

interface ChatMessageGroups {
  [date: string]: MessageModel[];
}
export interface Properties {
  name: string;
  messages: MessageModel[];
  onFetchMore: () => void;
  closeIndicator: () => void;
  hasNewMessage: number;
}

export class ChannelView extends React.Component<Properties> {
  bottomRef;
  constructor(props) {
    super(props);
    this.bottomRef = React.createRef();
  }

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

  scrollToBottom = () => {
    this.props.closeIndicator();
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

          return (
            <Message
              className={classNames('messages__message', { 'messages__message--first-in-group': isFirstFromUser })}
              key={message.id}
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

  render() {
    return (
      <div className='channel-view'>
        {this.props.hasNewMessage > 0 && (
          <div className='channel-view__newMessage'>
            <button
              type='button'
              className='channel-view__newMessage-bar'
              aria-label='Jump to last unread message'
              onClick={this.scrollToBottom}
            >
              <span className='channel-view__newMessage-bar-text'>{this.props.hasNewMessage} new messages</span>
            </button>
            <button
              type='button'
              className='channel-view__newMessage-alt'
              onClick={this.scrollToBottom}
            >
              Mark As Read
              <svg
                aria-hidden='true'
                role='img'
                width='24'
                height='24'
                viewBox='0 0 24 24'
              >
                <path
                  fill='currentColor'
                  fill-rule='evenodd'
                  clip-rule='evenodd'
                  d='M12.291 5.70697L15.998 9.41397L21.705 3.70697L20.291 2.29297L15.998 6.58597L13.705 4.29297L12.291 5.70697ZM1.99805 7H11.088C11.564 9.837 14.025 12 16.998 12V18C16.998 19.103 16.102 20 14.998 20H8.33205L2.99805 24V20H1.99805C0.894047 20 -0.00195312 19.103 -0.00195312 18V9C-0.00195312 7.897 0.894047 7 1.99805 7Z'
                ></path>
              </svg>
            </button>
          </div>
        )}
        <InvertedScroll className='channel-view__inverted-scroll'>
          <div className='channel-view__name'>
            <h1>Welcome to #{this.props.name}</h1>
            <span>This is the start of the channel.</span>
          </div>
          {this.props.messages.length && <Waypoint onEnter={this.props.onFetchMore} />}
          {this.props.messages.length && this.renderMessages()}
          <div ref={this.bottomRef} />
        </InvertedScroll>
      </div>
    );
  }
}
