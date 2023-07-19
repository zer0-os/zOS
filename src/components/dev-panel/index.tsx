import * as React from 'react';

import { Message, MessageSendStatus } from '../../store/messages';
import { bemClassName } from '../../lib/bem';
import './styles.scss';
import classNames from 'classnames';

const cn = bemClassName('dev-panel');

export interface Properties {
  messages: Message[];
  isOpen: boolean;
  toggleState: () => void;
  onMessageStatusChanged: (messageId: string, status: MessageSendStatus) => void;
}

export class DevPanel extends React.Component<Properties> {
  toggleState = () => {
    this.props.toggleState();
  };

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
        <div
          className={classNames('dev-panel__toggle', { 'dev-panel__toggle--closed': !this.props.isOpen })}
          onClick={this.toggleState}
        ></div>
        <div className={classNames('dev-panel', { 'dev-panel--closed': !this.props.isOpen })}>
          <div {...cn('content')}>
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
          </div>
        </div>
      </>
    );
  }
}
