import * as React from 'react';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';
import { Channel, ConversationStatus } from '../../../store/channels';

const cn = bemClassName('dev-panel-conversations');

export interface Properties {
  conversations: Channel[];
  onConversationStatusChanged: (id: string, status: ConversationStatus) => void;
}

export class Conversations extends React.PureComponent<Properties> {
  statusChanged = (e, id: any) => {
    const status = e.target.value;
    this.props.onConversationStatusChanged(id, parseInt(status));
  };

  statusOption(value, label) {
    return <option value={value}>{label}</option>;
  }

  name(conversation) {
    return conversation.name || conversation.otherMembers[0].firstName;
  }

  render() {
    return (
      <>
        {this.props.conversations.map((conversation) => {
          return (
            <div {...cn('conversation')} key={conversation.id}>
              <div>{this.name(conversation)}</div>
              <select value={conversation.conversationStatus} onChange={(e) => this.statusChanged(e, conversation.id)}>
                {this.statusOption(ConversationStatus.CREATED, 'Created')}
                {this.statusOption(ConversationStatus.CREATING, 'Creating')}
                {this.statusOption(ConversationStatus.ERROR, 'Error')}
              </select>
            </div>
          );
        })}
      </>
    );
  }
}
