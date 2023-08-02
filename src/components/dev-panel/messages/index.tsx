import * as React from 'react';

import { Message, MessageSendStatus } from '../../../store/messages';
import { bemClassName } from '../../../lib/bem';
import './styles.scss';

const cn = bemClassName('dev-panel-messages');

export interface Properties {
  messages: Message[];
  onMessageStatusChanged: (messageId: string, status: MessageSendStatus) => void;
}

export class Messages extends React.Component<Properties> {
  statusChanged = (e, messageId: any) => {
    const status = e.target.value;
    this.props.onMessageStatusChanged(messageId, parseInt(status));
  };

  statusOption(value, label) {
    return <option value={value}>{label}</option>;
  }

  render() {
    return (
      <>
        {this.props.messages.map((message) => {
          return (
            <div {...cn('message')} key={message.id}>
              <div>{message.message}</div>
              <select value={message.sendStatus} onChange={(e) => this.statusChanged(e, message.id)}>
                {this.statusOption(MessageSendStatus.SUCCESS, 'Success')}
                {this.statusOption(MessageSendStatus.IN_PROGRESS, 'In progress')}
                {this.statusOption(MessageSendStatus.FAILED, 'Failed')}
              </select>
            </div>
          );
        })}
      </>
    );
  }
}
