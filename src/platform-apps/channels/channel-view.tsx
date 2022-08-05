import React from 'react';
import { Message as MessageModel } from '../../store/messages';
import { Message } from './message';
import moment from 'moment';

interface ChatMessageGroups {
  [date: string]: MessageModel[];
}
export interface Properties {
  name: string;
  messages: MessageModel[];
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
      <div className='messages'>
        <div className='message__header'>
          <div className='message__header-date'>{this.formatDayHeader(day)}</div>
        </div>
        {allMessages.map((message) => (
          <Message
            key={message.id}
            {...message}
          />
        ))}
      </div>
    );
  }

  renderMessages() {
    const messagesByDay = this.getMessagesByDay();
    const groupDays = Object.keys(messagesByDay).sort((a, b) => (a > b ? 1 : -1));

    return <div className='container'>{groupDays.map((day: string) => this.renderDay(day, messagesByDay))}</div>;
  }

  render() {
    return (
      <div className='channel-view'>
        <div className='channel-view__name'>
          <h1>Welcome to #{this.props.name}</h1>
          <span>This is the start of the channel.</span>
        </div>
        {this.props.messages.length && this.renderMessages()}
      </div>
    );
  }
}
