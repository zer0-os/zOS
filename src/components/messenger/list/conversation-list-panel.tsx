import * as React from 'react';
import classNames from 'classnames';

import Tooltip from '../../tooltip';
import { lastSeenText } from './utils';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { SearchConversations } from '../search-conversations';
import { Channel } from '../../../store/channels';

interface ConversationListPanelProperties {
  directMessages: Channel[];
  directMessagesList: Channel[];
  conversationInMyNetworks: (directMessagesList: Channel[]) => void;
  handleMemberClick: (directMessageId: string) => void;
}

export class ConversationListPanel extends React.Component<ConversationListPanelProperties> {
  handleMemberClick(directMessageId: string) {
    this.props.handleMemberClick(directMessageId);
  }

  renderStatus(directMessage: Channel) {
    const isAnyUserOnline = directMessage.otherMembers.some((user) => user.isOnline);

    return (
      <div
        className={classNames('direct-message-members__user-status', {
          'direct-message-members__user-status--active': isAnyUserOnline,
        })}
      ></div>
    );
  }

  tooltipContent(directMessage: Channel) {
    if (directMessage.otherMembers && directMessage.otherMembers.length === 1) {
      return lastSeenText(directMessage.otherMembers[0]);
    }

    return otherMembersToString(directMessage.otherMembers);
  }

  renderMember = (directMessage: Channel) => {
    return (
      <Tooltip
        placement='left'
        overlay={this.tooltipContent(directMessage)}
        align={{
          offset: [
            10,
            0,
          ],
        }}
        className='direct-message-members__user-tooltip'
        key={directMessage.id}
      >
        <div
          className='direct-message-members__user'
          onClick={this.handleMemberClick.bind(this, directMessage.id)}
          key={directMessage.id}
        >
          {this.renderStatus(directMessage)}
          <div className='direct-message-members__user-name'>
            {directMessage.name || otherMembersToString(directMessage.otherMembers)}
          </div>
          {directMessage.unreadCount !== 0 && (
            <div className='direct-message-members__user-unread-count'>{directMessage.unreadCount}</div>
          )}
        </div>
      </Tooltip>
    );
  };

  render() {
    return (
      <div className='messages-list__items-conversations'>
        <div className='messages-list__items-conversations-input'>
          <SearchConversations
            className='messages-list__items-conversations-search'
            placeholder='Search contacts...'
            directMessagesList={this.props.directMessages}
            onChange={this.props.conversationInMyNetworks}
            mapSearchConversationsText={otherMembersToString}
          />
        </div>
        {this.props.directMessagesList.map(this.renderMember)}
      </div>
    );
  }
}
