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

  onConversationClick: (conversationId: string) => void;
  toggleConversation: () => void;
}

interface State {
  filter: string;
}

export class ConversationListPanel extends React.Component<Properties, State> {
  state = { filter: '' };

  searchChanged = (search: string) => {
    this.setState({ filter: search });
  };

  get filteredConversations() {
    if (this.state.filter === '') {
      return this.props.directMessages;
    }

    const searchRegEx = new RegExp(this.state.filter, 'i');
    return this.props.directMessages.filter((conversation) =>
      searchRegEx.test(otherMembersToString(conversation.otherMembers))
    );
  }

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

  render() {
    return (
      <>
        <div className='messages-list__direct-messages'>{this.renderNewMessageModal()}</div>
        <div className='messages-list__items'>
          <div className='messages-list__items-conversations-input'>
            <SearchConversations
              className='messages-list__items-conversations-search'
              placeholder='Search contacts...'
              onChange={this.searchChanged}
            />
          </div>
          <div className='messages-list__item-list'>
            {this.filteredConversations.map((dm) => (
              <ConversationItem key={dm.id} conversation={dm} onClick={this.props.onConversationClick} />
            ))}
          </div>
        </div>
        {/* Note: this does not work. directMessages is never null */}
        {!this.props.directMessages && <div className='messages-list__new-messages'>{this.renderNoMessages()}</div>}
      </>
    );
  }
}
