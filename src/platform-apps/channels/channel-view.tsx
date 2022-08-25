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
}

export class ChannelView extends React.Component<Properties> {
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
        <InvertedScroll className='channel-view__inverted-scroll'>
          <div className='channel-view__name'>
            <h1>Welcome to #{this.props.name}</h1>
            <span>This is the start of the channel.</span>
          </div>
          {this.props.messages.length && <Waypoint onEnter={this.props.onFetchMore} />}
          {this.props.messages.length && this.renderMessages()}
        </InvertedScroll>
      </div>
    );
  }
}
