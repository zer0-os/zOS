import React from 'react';

import classNames from 'classnames';
import { MessageInput } from './message-input';

require('./styles.scss');

export interface Properties {
  className?: string;
  isUserConnected?: boolean;
  onSubmit: (message: string) => void;
}

export class ChatWindow extends React.Component<Properties> {
  onSubmit = (message: string) => {
    this.props.onSubmit(message);
  };

  render() {
    return (
      <div className={classNames('chat-window__input-wrapper', this.props.className)}>
        {!this.props.isUserConnected && (
          <div className='chat-window__input-disabled'>You do not have permission to send messages in this channel</div>
        )}
        {this.props.isUserConnected && (
          <MessageInput
            onSubmit={this.onSubmit}
            className='chat-window__new-message'
            placeholder='Speak your truth...'
          />
        )}
      </div>
    );
  }
}
