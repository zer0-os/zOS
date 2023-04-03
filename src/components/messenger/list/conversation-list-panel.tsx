import * as React from 'react';
import classNames from 'classnames';

import Tooltip from '../../tooltip';
import { lastSeenText } from './utils';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { SearchConversations } from '../search-conversations';
import { Channel } from '../../../store/channels';
import { IconMessagePlusSquare, IconMessageQuestionSquare } from '@zero-tech/zui/icons';
import { IconButton } from '../../icon-button';

interface ConversationListPanelProperties {
  directMessages: Channel[];
  visibleDirectMessageIds: Channel['id'][];
  conversationInMyNetworks: (directMessagesList: Channel[]) => void;
  handleMemberClick: (directMessageId: string) => void;
  toggleConversation: () => void;
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

  renderNewMessageModal = (): JSX.Element => {
    return (
      <Tooltip
        placement='left'
        overlay='Create Zero Message'
        align={{
          offset: [
            10,
            0,
          ],
        }}
        className='direct-message-members__user-tooltip'
      >
        <div className='header-button'>
          <span className='header-button__title'>Conversations</span>
          <span className='header-button__icon' onClick={this.props.toggleConversation}>
            <IconButton
              onClick={this.props.toggleConversation}
              Icon={IconMessagePlusSquare}
              size={18}
              className='header-button__icon-plus'
            />
          </span>
        </div>
      </Tooltip>
    );
  };

  renderNoMessages = (): JSX.Element => {
    return (
      <div className='messages-list__start'>
        <div className='messages-list__start-title'>
          <span className='messages-list__start-icon'>
            <IconMessageQuestionSquare size={34} label='You have no messages yet' />
          </span>
          You have no messages yet
        </div>
        <span className='messages-list__start-conversation' onClick={this.props.toggleConversation}>
          Start a Conversation
        </span>
      </div>
    );
  };

  renderConversations() {
    if (this.props.directMessages.length < 0) {
      return null;
    } else {
      return this.props.directMessages.map((directMessage) => {
        if (this.props.visibleDirectMessageIds.includes(directMessage.id)) {
          return this.renderMember(directMessage);
        }
        return null;
      });
    }
  }

  render() {
    return (
      <>
        <div className='messages-list__direct-messages'>{this.renderNewMessageModal()}</div>
        {this.props.visibleDirectMessageIds && (
          <div className='messages-list__items'>
            <div className='messages-list__items-conversations-input'>
              <SearchConversations
                className='messages-list__items-conversations-search'
                placeholder='Search contacts...'
                directMessagesList={this.props.directMessages}
                onChange={this.props.conversationInMyNetworks}
                mapSearchConversationsText={otherMembersToString}
              />
            </div>
            {/* <div className='messages-list__item-list'>{this.props.visibleDirectMessageIds.map(this.renderMember)}</div> */}
            <div className='messages-list__item-list'>{this.renderConversations()}</div>
          </div>
        )}
        {/* Note: this does not work. directMessagesList is never null */}
        {!this.props.visibleDirectMessageIds && (
          <div className='messages-list__new-messages'>{this.renderNoMessages()}</div>
        )}
      </>
    );
  }
}
