import React from 'react';
import { Message as MessageModel } from '../../store/messages';
import { Message } from './message';

export interface Properties {
  name: string;
  messages: MessageModel[];
}

export class ChannelView extends React.Component<Properties> {
  renderMessages() {
    return this.props.messages.map((message) => (
      <Message
        key={message.id}
        {...message}
      />
    ));
  }

  render() {
    return (
      <div className='channel-view'>
        <div className='channel-view__name'>{this.props.name}</div>
        {this.renderMessages()}
      </div>
    );
  }
}
