import React from 'react';
import { Message as MessageModel } from '../../store/messages';
import { Message } from './message';

export interface Properties {
  name: string;
  messages: MessageModel[];
}

export class ChannelView extends React.Component<Properties> {
  renderMessages() {
    return (
      <div className='messages'>
        {this.props.messages.map((message) => (
          <Message
            key={message.id}
            {...message}
          />
        ))}
      </div>
    );
  }

  render() {
    return (
      <div className='channel-view'>
        <div className='channel-view__name'>
          <h1>Welcome to #{this.props.name}</h1>
          <span>This is the start of the channel.</span>
        </div>
        {this.renderMessages()}
      </div>
    );
  }
}
