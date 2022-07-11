import React from 'react';
import { Message as MessageModel } from '../../store/messages';

export class Message extends React.Component<MessageModel> {
  render() {
    return (
      <div className='message'>
        <div className='message__body'>{this.props.message}</div>
      </div>
    );
  }
}
