import * as React from 'react';

import { Message, MessageSendStatus } from '../../store/messages';
import { bemClassName } from '../../lib/bem';
import './styles.scss';
import classNames from 'classnames';
import { Messages } from './messages';
import { Conversations } from './conversations';
import { Channel, ConversationStatus } from '../../store/channels';

const cn = bemClassName('dev-panel');

export interface Properties {
  messages: Message[];
  conversations: Channel[];
  isOpen: boolean;
  toggleState: () => void;
  onMessageStatusChanged: (messageId: string, status: MessageSendStatus) => void;
  onConversationStatusChanged: (id: string, status: ConversationStatus) => void;
}

enum Tab {
  CONVERSATIONS,
  MESSAGES,
}

interface State {
  selectedTab: Tab;
}

export class DevPanel extends React.PureComponent<Properties, State> {
  state = { selectedTab: Tab.CONVERSATIONS };

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

  selectMessages = () => this.setState({ selectedTab: Tab.MESSAGES });
  selectConversations = () => this.setState({ selectedTab: Tab.CONVERSATIONS });

  render() {
    return (
      <>
        <div
          className={classNames('dev-panel__toggle', { 'dev-panel__toggle--closed': !this.props.isOpen })}
          onClick={this.toggleState}
        ></div>
        <div className={classNames('dev-panel', { 'dev-panel--closed': !this.props.isOpen })}>
          <div>
            <ul>
              <li
                onClick={this.selectConversations}
                {...cn('tab', this.state.selectedTab === Tab.CONVERSATIONS && 'active')}
              >
                Conversations
              </li>
              <li onClick={this.selectMessages} {...cn('tab', this.state.selectedTab === Tab.MESSAGES && 'active')}>
                Messages
              </li>
            </ul>
            <div {...cn('content')}>
              {this.state.selectedTab === Tab.CONVERSATIONS && (
                <Conversations
                  conversations={this.props.conversations}
                  onConversationStatusChanged={this.props.onConversationStatusChanged}
                />
              )}
              {this.state.selectedTab === Tab.MESSAGES && (
                <Messages messages={this.props.messages} onMessageStatusChanged={this.props.onMessageStatusChanged} />
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}
