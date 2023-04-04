import * as React from 'react';

import Tooltip from '../../tooltip';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { SearchConversations } from '../search-conversations';
import { Channel } from '../../../store/channels';
import { IconMessagePlusSquare, IconMessageQuestionSquare } from '@zero-tech/zui/icons';
import { IconButton } from '../../icon-button';
import { ConversationItem } from './conversation-item';

export interface Properties {
  directMessages: Channel[];
  visibleDirectMessageIds: Channel['id'][];
  conversationInMyNetworks: (directMessagesList: Channel[]) => void;
  handleMemberClick: (directMessageId: string) => void;
  toggleConversation: () => void;
}

export class ConversationListPanel extends React.Component<Properties> {
  handleMemberClick = (directMessageId: string) => {
    this.props.handleMemberClick(directMessageId);
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
      return this.props.directMessages
        .map((directMessage) => {
          if (this.props.visibleDirectMessageIds.includes(directMessage.id)) {
            return (
              <ConversationItem key={directMessage.id} conversation={directMessage} onClick={this.handleMemberClick} />
            );
          }
          return null;
        })
        .filter(Boolean);
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
