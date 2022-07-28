import React from 'react';
import { Message as MessageModel } from '../../store/messages';

export class Message extends React.Component<MessageModel> {
  render() {
    return (
      <div className='message'>
        <div className='message__date-header'>
          <div className='message__date-header-date'>Yesterday</div>
        </div>
        <div className='message__block'>
          <div className='message__block-icon'></div>
          <div className='message__block-body'>{this.props.message}</div>
        </div>
      </div>
    );
  }
}
